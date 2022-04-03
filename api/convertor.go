package handler

import (
	"archive/zip"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
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
const inputFileDir string = "/tmp/input/"
const outputFileDir string = "/tmp/output/"
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
	"sawtooth": generator.WaveSaw,
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
type TimeSignature []int

// Meta : Motivic.Meta class
type Meta struct {
	Key           string        `json:"key"`
	Mode          string        `json:"mode"`
	Tempo         Tempo         `json:"tempo"`
	TimeSignature TimeSignature `json:"timeSignature"`
}

// Motif : Motivic.Motif melody class
type Motif struct {
	ID    string      `json:"id"`
	Name  string      `json:"name"`
	Meta  Meta        `json:"meta"`
	Notes []MotifNote `json:"notes"`
}

// ConfigFrequencies :
type ConfigFrequencies [][]float64

// ConfigNotes :
type ConfigNotes []string

// MotivicConfig : Motivic music theory config
type MotivicConfig struct {
	Frequencies ConfigFrequencies `json:"frequencies"`
	Notes       ConfigNotes       `json:"notes"`
	Pitches     []Pitch           `json:"pitches"`
}

// JSONConversionRequestBody : API signature to generate a binary from JSON
type JSONConversionRequestBody struct {
	Motif Motif  `json:"motif"`
	Voice string `json:"voice"`
}

var notes = []string{
	"c",
	"c#",
	"d",
	"d#",
	"e",
	"f",
	"f#",
	"g",
	"g#",
	"a",
	"a#",
	"b",
}

var freqs = [][]float64{
	{
		16.351,
		17.324,
		18.354,
		19.445,
		20.601,
		21.827,
		23.124,
		24.499,
		25.956,
		27.5,
		29.135,
		30.868,
	},
	{
		32.703,
		34.648,
		36.708,
		38.891,
		41.203,
		43.654,
		46.249,
		48.999,
		51.913,
		55,
		58.27,
		61.735,
	},
	{
		65.406,
		69.296,
		73.416,
		77.782,
		82.407,
		87.307,
		92.499,
		97.999,
		103.826,
		110,
		116.541,
		123.471,
	},
	{
		130.813,
		138.591,
		146.832,
		155.563,
		164.814,
		174.614,
		184.997,
		195.998,
		207.652,
		220,
		233.082,
		246.942,
	},
	{
		261.626,
		277.183,
		293.665,
		311.127,
		329.628,
		349.228,
		369.994,
		391.995,
		415.305,
		440,
		466.164,
		493.883,
	},
	{
		523.251,
		554.365,
		587.33,
		622.254,
		659.255,
		698.456,
		739.989,
		783.991,
		830.609,
		880,
		932.328,
		987.767,
	},
	{
		1046.502,
		1108.731,
		1174.659,
		1244.508,
		1318.51,
		1396.913,
		1479.978,
		1567.982,
		1661.219,
		1760,
		1864.655,
		1975.533,
	},
	{
		2093.005,
		2217.461,
		2349.318,
		2489.016,
		2637.021,
		2793.826,
		2959.955,
		3135.964,
		3322.438,
		3520,
		3729.31,
		3951.066,
	},
	{
		4186.009,
		4434.922,
		4698.636,
		4978.032,
		5274.042,
		5587.652,
		5919.91,
		6271.928,
		6644.876,
		7040,
		7458.62,
		7902.132,
	},
	{
		8372.018,
		8869.844,
		9397.272,
		9956.064,
		10548.084,
		11175.304,
		11839.82,
		12543.856,
		13289.752,
		14080,
		14917.24,
		15804.264,
	},
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
	fmt.Println("Motivic Config...")
	fmt.Println(config)
	// handle rests - where pitch and octave are falsey
	if pitch == "" || pitch == "rest" {
		return 0.00
	}
	fmt.Printf("note pitch: %v\n", pitch)
	idx := Index(config.Notes, pitch)
	fmt.Printf("note index: %v\n", idx)
	freq := config.Frequencies[octave][idx]
	fmt.Printf("note freq: %v\n", freq)
	return freq
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
	var c MotivicConfig
	c.Notes = notes
	c.Frequencies = freqs
	c.setPitches()

	// assign config values to global var
	config = c
}

func getDurationInSeconds(dur int, t Tempo, ts TimeSignature) float64 {
	beatsPerSec := float64(t.Units) / float64(60)
	secsPerBeat := float64(1) / float64(beatsPerSec)
	beatsPerNote := float64(dur) / float64(ts[0]*ts[1])
	durSecs := secsPerBeat * beatsPerNote
	return float64(durSecs)
}

func convertMIDIFileToWAVFile(inputFileName string, outputFilePath string, wf string, c chan<- bool) {
	success := false
	// parse the MIDI file to Motivic format
	motifs, err := parseMIDIFile(inputFileName)
	if err != nil || len(motifs) == 0 {
		errMsg := fmt.Sprint("ERROR: parseMIDIFile() ", err)
		fmt.Println(errMsg)
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

func convertMotifToWAVFile(motif Motif, outputFilePath string, wf string, c chan<- bool) {
	success := false

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
	meta := Meta{Tempo: t, TimeSignature: ts}
	m = Motif{Notes: parsedEvents, Meta: meta}
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
	fmt.Println("mapping Motif to audio buffers")
	var buffers []audio.FloatBuffer
	for _, n := range m.Notes {
		fmt.Printf("Note: %v\n", n)
		freq := getPitchFrequency(n.Name, n.Octave)
		fmt.Printf("note: %v octave: %v frequency %v\n", freq, n.Name, n.Octave)
		// TODO: duration needs to be converted to seconds?
		// TODO: fix this - right now am rounding up to nearest second
		ds := getDurationInSeconds(n.Duration, m.Meta.Tempo, m.Meta.TimeSignature)
		fmt.Printf("duration in seconds: %v\n", ds)
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

func errorResponse(w http.ResponseWriter, statusCode int, message string) {
	var jsonData []byte
	tsCreated := time.Now()
	data := APIResponse{URL: "", CreatedTimeStamp: tsCreated, Success: false, Message: message}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	jsonData, _ = json.MarshalIndent(data, "", "    ")
	w.Write(jsonData)
}

func conversionResponse(w http.ResponseWriter, outputFilePath string, fileName string) {
	data := APIResponse{}
	tsCreated := time.Now()
	// conversion failed
	if outputFilePath == "" {
		errorResponse(w, http.StatusUnprocessableEntity, "Conversion failed")
	} else {
		tsExpires := tsCreated.Local().Add(time.Minute * time.Duration(downloadTTLMins))
		strExpires := tsExpires.Format(time.RFC1123)
		// fileURL := getAbsoluteURL("convertor/"+fileName, "")
		fileURL := "/api/convertor/" + fileName
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
	fileName := paths[2:]
	if len(fileName) == 1 {
		fileName := fileName[0]
		userFileName := strings.Split(fileName, "_")[1]
		downloadFilePath := outputFileDir + fileName
		if fileExists(downloadFilePath) {
			serveDownloadFile(w, r, downloadFilePath, userFileName)
		} else {
			fmt.Println("Requested file does not exist or has expired")
			errorResponse(w, http.StatusNotFound, fmt.Sprintf("requested file %v does not exist or has expired", downloadFilePath))
		}
	} else {
		fmt.Println("Bad request path")
		errorResponse(w, http.StatusNotFound, "Bad request path - no file name")
	}
}

func midiFileUploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		errorResponse(w, http.StatusNotAcceptable, fmt.Sprintf(r.Method, "not accepted at upload endpoint"))
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
		errMsg := fmt.Sprintf("Error parsing the file upload %s", err)
		fmt.Println(errMsg)
		errorResponse(w, http.StatusUnprocessableEntity, errMsg)
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
	conversionResponse(w, zipFileOutputPath, zipFileName)
}

func jsonDataConversionHandler(w http.ResponseWriter, r *http.Request) {
	// 1. CONVERT JSON REQUEST BODY TO MOTIF STRUCT

	// Use http.MaxBytesReader to enforce a maximum read of 1MB from the
	// request body. A request body larger than that will now result in
	// Decode() returning a "http: request body too large" error.
	r.Body = http.MaxBytesReader(w, r.Body, 1048576)
	dec := json.NewDecoder(r.Body)

	var b JSONConversionRequestBody

	fmt.Println("beginning to decode JSON")
	err := dec.Decode(&b)
	if err != nil {
		var syntaxError *json.SyntaxError
		var unmarshalTypeError *json.UnmarshalTypeError

		fmt.Println("JSON decoding error", err)

		switch {
		// Catch any syntax errors in the JSON and send an error message
		// which interpolates the location of the problem to make it
		// easier for the client to fix.
		case errors.As(err, &syntaxError):
			msg := fmt.Sprintf("Request body contains badly-formed JSON (at position %d): %s", syntaxError.Offset, err)
			http.Error(w, msg, http.StatusBadRequest)

		// In some circumstances Decode() may also return an
		// io.ErrUnexpectedEOF error for syntax errors in the JSON. There
		// is an open issue regarding this at
		// https://github.com/golang/go/issues/25956.
		case errors.Is(err, io.ErrUnexpectedEOF):
			msg := fmt.Sprintf("Request body contains badly-formed JSON")
			http.Error(w, msg, http.StatusBadRequest)

		// Catch any type errors, like trying to assign a string in the
		// JSON request body to a int field in our Person struct. We can
		// interpolate the relevant field name and position into the error
		// message to make it easier for the client to fix.
		case errors.As(err, &unmarshalTypeError):
			msg := fmt.Sprintf("Request body contains an invalid value for the %q field (at position %d)", unmarshalTypeError.Field, unmarshalTypeError.Offset)
			http.Error(w, msg, http.StatusBadRequest)

		// An io.EOF error is returned by Decode() if the request body is
		// empty.
		case errors.Is(err, io.EOF):
			msg := "Request body must not be empty"
			http.Error(w, msg, http.StatusBadRequest)

		// Catch the error caused by the request body being too large. Again
		// there is an open issue regarding turning this into a sentinel
		// error at https://github.com/golang/go/issues/30715.
		case err.Error() == "http: request body too large":
			msg := "Request body must not be larger than 1MB"
			http.Error(w, msg, http.StatusRequestEntityTooLarge)

		// Otherwise default to logging the error and sending a 500 Internal
		// Server Error response.
		default:
			log.Println(err.Error())
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}
		return
	}

	message := fmt.Sprintf("SUCCESS! Motif %v deserialized from JSON", b.Motif.Name)
	fmt.Println(message)

	// 2. CONVERT MOTIF TO AUDIO FILE
	fmt.Println("Converting Motif...")
	var outputFileName string = "my-motif"
	if len(b.Motif.Name) > 0 {
		outputFileName = b.Motif.Name
	}
	randomString := getRandomString(8)
	// TODO: forego writing files to disk: keep bytes in memory and return a blob?
	wavFileoutputFilePath, _ := getFilePathFromName(outputFileDir, randomString, outputFileName, "wav")
	// channel to wait for go routine response
	c := make(chan bool)
	go convertMotifToWAVFile(b.Motif, wavFileoutputFilePath, b.Voice, c)
	success := <-c
	go expireFile(wavFileoutputFilePath)

	// 3. RETURN NEW AUDIO FILE
	var zipFileOutputPath string = ""
	var zipFileName string = ""
	if success {
		zipFileOutputPath, zipFileName = getFilePathFromName(outputFileDir, randomString, outputFileName, "zip")
		filesToZip := []string{wavFileoutputFilePath}
		if err := zipFiles(zipFileOutputPath, filesToZip, randomString); err != nil {
			panic(err)
		}
		fmt.Println("Zipped File:", zipFileOutputPath)
		serveDownloadFile(w, r, zipFileOutputPath, zipFileName)
	} else {
		errorResponse(w, http.StatusGatewayTimeout, "we hath failed thee")
	}
}

// Handler ...
// REST API to accept files for conversion
// TODO: handle polyphonic MIDI - support or return helpful exception response
// TODO: increase conversion types:
// 		Motivic.json file => MIDI
// 		Motivic JSON payload => MIDI
// 		Motivic JSON payload => WAV
// 		MIDI files => Motivic JSON response
// 		MIDI files => Motivic.json file
func Handler(w http.ResponseWriter, r *http.Request) {
	// set the music theory config
	initMotivicConfig()
	// TODO: this is a hacky compromise to process distinct REST operations on the same endpoint
	// I'm only doing this because the file conversion code currently writes a temp file to disk
	// and since these are serverless functions, upload and download operations can't share a
	// file system. To work around this, I'm parsing a request header check wether or not this is
	// and upload or download request.

	// Let's check out those headers!
	for k, v := range r.Header {
		fmt.Printf("request header: [%s] [%s]\n", k, v)
	}
	// Check if the payload is JSON or a file
	var isJSONOperation = false
	if contentTypeHeader, ok := r.Header["Content-Type"]; ok {
		//do something here
		if contentTypeHeader[0] == "application/json" {
			isJSONOperation = true
		}
	}
	if isJSONOperation {
		fmt.Println("Handling as a JSON conversion...")
		jsonDataConversionHandler(w, r)
	} else {
		fmt.Println("Handling as a File Upload operation...")

		// Check the X-Motivic-Operation header to see if this is an upload or a download request and handle accordingly
		var isFileUploadOperation bool = false

		if operationHeader, ok := r.Header["X-Motivic-Operation"]; ok {
			//do something here
			if operationHeader[0] == "upload" {
				isFileUploadOperation = true
			}
		}
		if isFileUploadOperation {
			midiFileUploadHandler(w, r)
		} else {
			fileDownloadHandler(w, r)
		}
	}
}
