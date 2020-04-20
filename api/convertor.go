package midifileuploadhandler

import (
	"archive/zip"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"math/rand"
	"mime/multipart"
	"net/http"
	"os"
	"os/signal"
	"path"
	"reflect"
	"strings"
	"syscall"
	"time"

	"github.com/go-audio/aiff"
	"github.com/go-audio/audio"
	"github.com/go-audio/generator"
	"github.com/go-audio/midi"
	"github.com/go-audio/wav"
)

const protocol string = "http"
const domain string = "localhost"
const port string = "8080"
const inputFileDir string = "./input/"
const outputFileDir string = "./output/"
const maxUploadSizeMb int64 = 10

// 10 MB expressed with bitwise operator
const maxUploadSizeBytes int64 = maxUploadSizeMb << 20
const maxRequestBodySizeBytes int64 = maxUploadSizeBytes + 512

const downloadTTLMins int64 = 1

// Setting global audio config for 16/44/mono
const audioBitDepth int = 16
const audioSampleRate int = 44100
const midiNoteValueOffset int = -11
const midiDurationValueDivisor int = 8
const defaultWaveForm generator.WaveType = generator.WaveSine
const wavFile string = "wav"

var audioFormat = audio.FormatMono44100
var waveForm = map[string]generator.WaveType{
	"sine":     generator.WaveSine,
	"triangle": generator.WaveTriangle,
	"square":   generator.WaveSqr,
	"saw":      generator.WaveSaw,
}
var outputDirs = []string{"input", "output"}

// APIResponse : response for /download/<filename>
type APIResponse struct {
	URL              string    `json:"url"`
	CreatedTimeStamp time.Time `json:"created"`
	Message          string    `json:"message"`
	Success          bool      `json:"success"`
}

// FileSystem custom file system handler
type FileSystem struct {
	fs http.FileSystem
}

// Pitch : scientific notation pitch
type Pitch struct {
	Name   string `json:"name"`
	Octave int    `json:"octave"`
	Value  int    `json:"value"`
}

// Note : Motivic.Note class
type Note struct {
	Value    int `json:"value"` // scientific notation
	Duration int `json:"duration"`

	// TODO: migrate to computed property methods
	// computed
	Name   string `json:"name"`   // Scientific pitch notation note https://en.wikipedia.org/wiki/Scientific_pitch_notation
	Octave int    `json:"octave"` // Scientific pitch notation octave https://en.wikipedia.org/wiki/Scientific_pitch_notation
	Pitch  string `json:"pitch"`  // Scientific pitch notation (note + octave) https://en.wikipedia.org/wiki/Scientific_pitch_notation
}

// Note factory function
func newNote(v int, d int) Note {
	name, octave := getNoteNameAndOctave(v)
	pitchStr := fmt.Sprintf("%v%d", name, octave)
	n := Note{Value: v, Duration: d, Name: name, Octave: octave, Pitch: pitchStr}
	return n
}

// MotifNote : Motivic.Note decorated with motif-relative computed fields
type MotifNote struct {
	Note
	// relative (to Motif)
	// TODO: migrate to computed property methods
	Steps        int `json:"steps"`        // relative to Motif.Notes[0].Value
	StartingBeat int `json:"startingBeat"` // relative to Motif.Notes[0].StartingBeat
	Interval     int `json:"interval"`     // relative to Motif.Key
}

// Tempo : Motivic.Tempo class
type Tempo struct {
	Type  string `json:"type"`
	Units int    `json:"units"`
}

// TimeSignature : Motivic.TimeSignature class
type TimeSignature struct {
	Beat int `json:"beat"`
	Unit int `json:"unit"`
}

// Motif : Motivic.Motif melody class
type Motif struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Key  string `json:"key"`
	Mode string `json:"mode"`
	Tempo
	TimeSignature
	Notes []MotifNote
}

// MotivicConfig : Motivic music theory config
type MotivicConfig struct {
	Frequencies [][]float64 `json:"frequencies"`
	Notes       []string    `json:"notes"`
	Pitches     []Pitch
}

var config MotivicConfig

// Index : simple utils for getting index of a slice element
func Index(vs []string, t string) int {
	for i, v := range vs {
		if v == t {
			return i
		}
	}
	return -1
}

func getNoteNameAndOctave(value int) (string, int) {
	// notes with negative value are rests
	if value < 0 {
		return "", -1
	}
	note := config.Pitches[value-1]
	return note.Name, note.Octave
}

func getPitchFrequency(pitch string, octave int) float64 {
	// handle rests - where pitch and octave are falsey
	if pitch == "" {
		return 0.00
	}
	idx := Index(config.Notes, pitch)
	return config.Frequencies[octave][idx]
}
func (c *MotivicConfig) setPitches() {
	var pitches []Pitch
	for octIdx := range c.Frequencies {
		for noteIdx, n := range c.Notes {
			p := Pitch{Name: n, Octave: octIdx, Value: (octIdx * 12) + noteIdx + 1}
			pitches = append(pitches, p)
		}
	}
	c.Pitches = pitches
}

func initMotivicConfig() {
	// read in app config from json file in root
	f, err := ioutil.ReadFile("./config.json")
	if err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}
	var c MotivicConfig
	json.Unmarshal(f, &c)
	c.setPitches()

	// assign config values to global var
	config = c
}

func getDurationInSeconds(dur int, t Tempo, ts TimeSignature) float64 {
	beatsPerSec := float64(t.Units) / float64(60)
	secsPerBeat := float64(1) / float64(beatsPerSec)
	beatsPerNote := float64(dur) / float64(ts.Beat*ts.Unit)
	durSecs := secsPerBeat * beatsPerNote
	return float64(durSecs)
}

func convertMIDIFileToWAVFile(inputFileName string, outputFilePath string, wf string, c chan<- bool) {
	success := false
	// parse the MIDI file to Motivic format
	motifs, err := parseMIDIFile(inputFileName)
	if err != nil || len(motifs) == 0 {
		fmt.Println("ERROR: parseMIDIFile", err)
		c <- success
		return
	}
	// for now Motivic only supports monophonic melodies so just grab the first track
	if len(motifs) > 1 {
		fmt.Println("ERROR: MIDI file is not monophonic")
		c <- success
		return
	}
	motif := motifs[0]

	for _, n := range motif.Notes {
		fmt.Printf("MOTIF NOTE:\t%+v\n", n)
	}

	// convert Motif to audio buffers
	motifBuffers := motifAudioMap(motif, wf)
	// ignore error if dir already exists
	_ = os.Mkdir(outputFileDir, 0777)
	// generate the audio file
	outputFile, err := os.Create(outputFilePath)
	if err != nil {
		fmt.Println("ERROR:", err)
		c <- success
		return
	}
	defer outputFile.Close()
	if err := encodeAudioFile(wavFile, motifBuffers, outputFile); err != nil {
		fmt.Println("ERROR: encodeAudioFile", err)
		c <- success
		return
	}
	fmt.Println("Audio file generated at", outputFilePath)
	c <- true
	return
}

// take a JSON file on disk and return parsed music events (Motivic.Motif format)
func parseJSONFile(filePath string) ([]Motif, error) {
	var parsedTracks []Motif
	var err error = nil
	defer func() {
		if panicErr := recover(); panicErr != nil {
			fmt.Println("Recovered in parseJSONFile", panicErr)
			parsedTracks = nil
			err = errors.New("JSON file failed to parse")
		}
	}()
	file, err := os.Open(filePath)
	if err != nil {
		return parsedTracks, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)

	parsedJSON := []map[string]interface{}{}

	// Read the array open bracket
	decoder.Token()

	data := map[string]interface{}{}
	for decoder.More() {
		decoder.Decode(&data)
		parsedJSON = append(parsedJSON, data)
	}
	// TODO: convert parsed JSON to Motif tracks
	return parsedTracks, err
}

// take a MIDI file on disk and return parsed music events (Motivic.Motif format)
func parseMIDIFile(filePath string) ([]Motif, error) {
	var parsedTracks []Motif
	var err error = nil
	defer func() {
		if panicErr := recover(); panicErr != nil {
			fmt.Println("Recovered in parseMIDIFile", panicErr)
			parsedTracks = nil
			err = errors.New("MIDI file failed to parse")
		}
	}()
	file, err := os.Open(filePath)
	if err != nil {
		return parsedTracks, err
	}
	defer file.Close()
	decodedFile := midi.NewDecoder(file)
	if err := decodedFile.Parse(); err != nil {
		return parsedTracks, err
	}

	for _, t := range decodedFile.Tracks {
		parsedTrack, err := parseMIDITrack(t)
		if err != nil {
			fmt.Println("ERROR parsing track", err)
			return parsedTracks, err
		}
		parsedTracks = append(parsedTracks, parsedTrack)
	}
	return parsedTracks, err
}

func printReflectionInfo(t *midi.Track) {
	// expect CustomStruct if non pointer
	fmt.Println("Actual type is:", reflect.TypeOf(t))

	// expect struct if non pointer
	fmt.Println("Value type is:", reflect.ValueOf(t).Kind())

	if reflect.ValueOf(t).Kind() == reflect.Ptr {
		// expect: CustomStruct
		fmt.Println("Indirect type is:", reflect.Indirect(reflect.ValueOf(t)).Kind()) // prints interface

		// expect: struct
		fmt.Println("Indirect value type is:", reflect.Indirect(reflect.ValueOf(t)).Kind()) // prints interface
	}

	fmt.Println("")
}

func parseMIDITrack(track *midi.Track) (Motif, error) {
	// serialize midi.Track to Motivic.Motif
	// TODO: remove hardcoded time signature - parse from MIDI file
	fmt.Printf("\n*midi.Track: \t%+v\n\n", track)
	printReflectionInfo(track)
	m := Motif{}
	if track == nil {
		return m, fmt.Errorf("ERROR: parseMIDITrack() - track is nil")
	}
	bpm := track.Events[0].Bpm
	t := Tempo{Type: "bpm", Units: int(bpm)}
	ts := TimeSignature{4, 4}
	var parsedEvents []MotifNote
	for _, e := range track.AbsoluteEvents() {
		parsedEvent, err := parseMIDIEvent(e)
		if err != nil {
			fmt.Println(err)
			return m, err
		}
		parsedEvents = append(parsedEvents, parsedEvent)
	}
	parsedEvents = getNotesWithInsertedRests(parsedEvents)
	m = Motif{Notes: parsedEvents, Tempo: t, TimeSignature: ts}
	return m, nil
}

func getNotesWithInsertedRests(events []MotifNote) []MotifNote {
	// MIDI doesn't treat rests as events so
	// fabricate rest notes to fill in the gaps in parsedEvents
	var notes []MotifNote
	for i, e := range events {
		beatPosition := 1
		if i != 0 {
			// this is the first event
			prevNote := events[i-1]
			beatPosition = prevNote.StartingBeat + prevNote.Duration
		}
		// this is not the first event
		if e.StartingBeat != beatPosition {
			// there is a gap where a rest should go
			// for now, Note with negative value is a Rest
			rest := newNote(-1, e.StartingBeat-beatPosition)
			mn := MotifNote{
				Note:         rest,
				StartingBeat: beatPosition,
			}
			// Insert the rest before this note
			notes = append(notes, mn)
		}
		// there is no gap so add the note
		notes = append(notes, e)
	}
	return notes
}

// converts MIDI event.MIDINote to Motivic.Note.value
func convertMIDINote(note int) int {
	return note + midiNoteValueOffset
}

func convertMIDINoteDuration(dur int) int {
	return dur / midiDurationValueDivisor
}

func parseMIDIEvent(e *midi.AbsEv) (MotifNote, error) {
	// TODO: serialize midi.Event to Motivic.Note
	fmt.Printf("MIDI EVENT:\t%+v\n", e)
	// TODO: make sure conversion from MIDINote to MotifNote.value is correct!
	// TODO: handle RESTS!!!
	value := convertMIDINote(e.MIDINote)
	// TODO: conversion from ticks to MotifNote.duration is correct!
	// TODO: make sure that these are always both ints!
	duration := convertMIDINoteDuration(e.Duration)
	n := newNote(value, duration)
	mn := MotifNote{
		Note: n,
		// TODO: make sure this conversion from ticks to MotifNote.startingBeat is correct
		// TODO: make sure that these are always both ints!
		StartingBeat: convertMIDINoteDuration(e.Start) + 1,
	}
	return mn, nil
}

// take motif and return slice of audio buffers
func motifAudioMap(m Motif, voice string) []audio.FloatBuffer {
	var buffers []audio.FloatBuffer
	for _, n := range m.Notes {
		freq := getPitchFrequency(n.Name, n.Octave)
		// TODO: duration needs to be converted to seconds?
		// TODO: fix this - right now am rounding up to nearest second
		ds := getDurationInSeconds(n.Duration, m.Tempo, m.TimeSignature)
		fmt.Println("AUDIO NOTE DATA:", n.Name, n.Octave, n.Pitch, "freq:", freq, "secs:", ds)
		// TODO: handle rests!!!
		buf := generateAudioFrequency(freq, ds, voice)
		buffers = append(buffers, *buf)
	}
	return buffers
}

// take motif and return slice of MIDI buffers
func motifMIDIMap(m Motif) {
	// TODO: write this
}

// take motif and return JSON representation
func motifJSONMap(m Motif) {
	// TODO: write this
}

// take frequency, duration, bit depth, and sample rate and return audio buffer of one note
func generateAudioFrequency(freq float64, durSecs float64, voice string) *audio.FloatBuffer {
	wf := waveForm[voice]
	if wf == 0 {
		wf = defaultWaveForm
	}
	osc := generator.NewOsc(wf, float64(freq), audioSampleRate)
	// our osc generates values from -1 to 1, we need to go back to PCM scale
	factor := float64(audio.IntMaxSignedValue(audioBitDepth))
	osc.Amplitude = factor
	// buf.Data slice has length bitDepth * seconds
	data := make([]float64, int(math.Ceil(float64(audioSampleRate)*durSecs)))
	buf := &audio.FloatBuffer{Data: data, Format: audioFormat}
	osc.Fill(buf)
	return buf
}

func encodeWAVFile(bufs []audio.FloatBuffer, w io.WriteSeeker) error {
	// APPROACH: iterate through buffers and encode each one sequentially
	e := wav.NewEncoder(w, bufs[0].PCMFormat().SampleRate, audioBitDepth, bufs[0].PCMFormat().NumChannels, 1)
	for _, b := range bufs {
		err := e.Write(b.AsIntBuffer())
		if err != nil {
			return err
		}
	}
	return e.Close()
}

func encodeAIFFile(bufs []audio.FloatBuffer, w io.WriteSeeker) error {
	e := aiff.NewEncoder(w,
		bufs[0].PCMFormat().SampleRate,
		audioBitDepth,
		bufs[0].PCMFormat().NumChannels)
	for _, b := range bufs {
		err := e.Write(b.AsIntBuffer())
		if err != nil {
			return err
		}
	}
	return e.Close()
}

// take slice of audio buffers and write audio file
func encodeAudioFile(format string, bufs []audio.FloatBuffer, w io.WriteSeeker) error {
	switch format {
	case "wav":
		return encodeWAVFile(bufs, w)
	case "aiff":
		return encodeAIFFile(bufs, w)
	default:
		return errors.New("unknown format")
	}
}

func encodeMIDIFile(bufs []audio.FloatBuffer, w io.WriteSeeker) {
	// TODO: write this
}

func encodeJSONFile(jsonData []byte, filePath string) {
	// TODO: write this
	file, _ := os.OpenFile(filePath, os.O_CREATE, os.ModePerm)
	defer file.Close()
	encoder := json.NewEncoder(file)
	encoder.Encode(jsonData)
}

func getRandomString(length int) string {
	rand.Seed(time.Now().UnixNano())
	chars := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
		"abcdefghijklmnopqrstuvwxyz" +
		"0123456789")

	var b strings.Builder
	for i := 0; i < length; i++ {
		b.WriteRune(chars[rand.Intn(len(chars))])
	}
	return b.String()
}

func getFilePathFromName(dir string, key string, fileName string, fileType string) (string, string) {
	encodedName := key + "_" + fileName + "." + fileType
	encodedFilePath := dir + encodedName
	return encodedFilePath, encodedName
}

func getFileNameFromPath(path string, key string) string {
	return strings.Split(path, key+"_")[1]
}

// fileExists checks if a file exists and is not a directory before we
// try using it to prevent further errors.
func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

func expireFile(filePath string) {
	if filePath == "" || !fileExists(filePath) {
		return
	}
	fileTimer := time.NewTimer(60 * time.Second)
	<-fileTimer.C
	fmt.Println("File deleted:", filePath)
	os.Remove(filePath)
}

func cleanUp() {
	// clean up binaries now
	cleanUpDirs()

	// start goroutine to listen for process interruption/termination
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigs
		// cleanup binaries on exit
		cleanUpDirs()
		os.Exit(0)
	}()
}

func cleanUpDirs() []error {
	// delete audio files from filesystem
	var errs []error
	for _, dir := range outputDirs {
		err := cleanUpDir(dir)
		if err != nil {
			fmt.Println(err)
			errs = append(errs, err)
		}
	}
	return errs
}

func cleanUpDir(dir string) error {
	names, err := ioutil.ReadDir(dir)
	if err != nil {
		return err
	}
	for _, entry := range names {
		os.RemoveAll(path.Join([]string{dir, entry.Name()}...))
	}
	return nil
}

func saveFile(file multipart.File, handle *multipart.FileHeader, filePath string) {
	data, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Println(err)
		return
	}
	// ignore error if dir already exists
	_ = os.Mkdir(inputFileDir, 0777)
	err = ioutil.WriteFile(filePath, data, 0666)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("Upload saved locally")
}

// ZipFiles compresses one or many files into a single zip archive file.
// Param 1: filename is the output zip file's name.
// Param 2: files is a list of files to add to the zip.
func zipFiles(filename string, files []string, key string) error {
	zipFile, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	// Add files to zip
	for _, file := range files {
		if err = addFileToZip(zipWriter, file, key); err != nil {
			return err
		}
	}
	return nil
}

func addFileToZip(zipWriter *zip.Writer, filePath string, key string) error {
	fileToZip, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer fileToZip.Close()

	// Get the file information
	info, err := fileToZip.Stat()
	if err != nil {
		return err
	}

	header, err := zip.FileInfoHeader(info)
	if err != nil {
		return err
	}

	// Using FileInfoHeader() above only uses the basename of the file.
	// To reflect dir structure, set this to the full path.
	header.Name = getFileNameFromPath(filePath, key)

	// Change to deflate to gain better compression
	// see http://golang.org/pkg/archive/zip/#pkg-constants
	header.Method = zip.Deflate

	writer, err := zipWriter.CreateHeader(header)
	if err != nil {
		return err
	}
	_, err = io.Copy(writer, fileToZip)
	return err
}

func getAbsoluteURL(path string, query string) string {
	qs := ""
	if query != "" {
		qs = "?" + query
	}
	return fmt.Sprintf("%v://%v:%v/%v%v", protocol, domain, port, path, qs)
}

func conversionResponse(w http.ResponseWriter, outputFilePath string, fileName string) {
	data := APIResponse{}
	tsCreated := time.Now()
	// conversion failed
	if outputFilePath == "" {
		data = APIResponse{URL: "", CreatedTimeStamp: tsCreated, Success: false, Message: "Conversion failed"}
		w.WriteHeader(http.StatusUnprocessableEntity)
	} else {
		tsExpires := tsCreated.Local().Add(time.Minute * time.Duration(downloadTTLMins))
		strExpires := tsExpires.Format(time.RFC1123)
		fileURL := getAbsoluteURL("download/"+fileName, "")
		data = APIResponse{URL: fileURL, CreatedTimeStamp: tsCreated, Success: true, Message: "File converted"}
		fmt.Println(strExpires)
		w.Header().Set("Expires", strExpires)
		w.WriteHeader(http.StatusOK)
	}
	var jsonData []byte
	jsonData, _ = json.MarshalIndent(data, "", "    ")
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
	go expireFile(outputFilePath)
}

func serveDownloadFile(w http.ResponseWriter, r *http.Request, filePath string, fileName string) {
	// tell the browser the returned content should be downloaded
	contentDisposition := fmt.Sprintf("attachment; filename=\"%v\"", fileName)
	w.Header().Add("Content-Disposition", contentDisposition)
	http.ServeFile(w, r, filePath)
}

func fileDownloadHandler(w http.ResponseWriter, r *http.Request) {
	paths := strings.Split(r.URL.Path, "/")
	fileName := paths[2:len(paths)]
	if len(fileName) == 1 {
		fileName := fileName[0]
		userFileName := strings.Split(fileName, "_")[1]
		downloadFilePath := outputFileDir + fileName
		if fileExists(downloadFilePath) {
			serveDownloadFile(w, r, downloadFilePath, userFileName)
		} else {
			fmt.Println("Requested file does not exist or has expired")
			http.Redirect(w, r, "/", http.StatusSeeOther)
		}
	} else {
		fmt.Println("Bad request path")
		http.Redirect(w, r, "/", http.StatusSeeOther)
	}
}

// REST API to accept files for conversion
// TODO: handle polyphonic MIDI - support or return helpful exception response
// TODO: increase conversion types:
// 		Motivic.json file => MIDI
// 		Motivic JSON payload => MIDI
// 		Motivic JSON payload => WAV
// 		MIDI files => Motivic JSON response
// 		MIDI files => Motivic.json file
func midiFileUploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		fmt.Println(r.Method, "not accepted at upload endpoint")
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
	fmt.Println("MIDI File Upload Endpoint Hit")
	// 1. PARSE UPLOADED FILE
	fmt.Println("Parsing uploaded file...")
	tsCreated := time.Now()
	// setting max memory allocation of file to 10MB the rest will be stored automatically in tmp files
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBodySizeBytes)
	r.ParseMultipartForm(maxUploadSizeBytes)
	midiFile, midiFileHandle, err := r.FormFile("myMIDIFile")
	if err != nil {
		fmt.Println("Error parsing the file upload")
		fmt.Println(err)
		return
	}
	defer midiFile.Close()
	fmt.Printf("Uploaded File: \t%+v at %v\n", midiFileHandle.Filename, tsCreated)
	fmt.Printf("File Size: \t%+vkb\n", midiFileHandle.Size)
	fmt.Printf("MIME Header: \t%+v\n", midiFileHandle.Header)
	fmt.Println("Successfully uploaded file")

	// 2. SAVE UPLOADED MIDI FILE TO DISK
	randomString := getRandomString(8)
	inputFilePath := inputFileDir + randomString + "_" + midiFileHandle.Filename
	saveFile(midiFile, midiFileHandle, inputFilePath)
	go expireFile(inputFilePath)

	// 3. CONVERT MIDI FILE TO AUDIO FILE
	fmt.Println("Converting copied file...")
	waveFormName := r.Form.Get("myWaveForm")
	outputFileName := r.Form.Get("wavFileName")
	wavFileoutputFilePath, _ := getFilePathFromName(outputFileDir, randomString, outputFileName, "wav")
	// channel to wait for go routine response
	c := make(chan bool)
	go convertMIDIFileToWAVFile(inputFilePath, wavFileoutputFilePath, waveFormName, c)
	success := <-c
	go expireFile(wavFileoutputFilePath)

	// 4. RETURN URL OF NEW FILE
	var zipFileOutputPath string = ""
	var zipFileName string = ""
	if success {
		zipFileOutputPath, zipFileName = getFilePathFromName(outputFileDir, randomString, outputFileName, "zip")
		filesToZip := []string{wavFileoutputFilePath}
		if err := zipFiles(zipFileOutputPath, filesToZip, randomString); err != nil {
			panic(err)
		}
		fmt.Println("Zipped File:", zipFileOutputPath)

	}
	serveDownloadFile(w, r, zipFileOutputPath, zipFileName)
}
