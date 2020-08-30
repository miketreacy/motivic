<script>
    import { onMount, createEventDispatcher } from 'svelte'
    import Config from '../Config'
    import Nexus from 'nexusui'
    // can't import it this way because of a nested dependency export/import issue
    // import Tone from 'tone'
    import DropDown from './DropDown.svelte'
    import MotivicUtils from '../MotivicUtils'
    export let motifs = []

    let sequencer
    let synth
    let synthPattern = []
    let synthPart
    let selectedVoice = 'square'
    let selectedVolume = 0
    let sequencerRows = []
    let effectState = { reverb: false, delay: false }
    let effectMap = { reverb: null, delay: null }
    let defaultRows = [
        'B4',
        'A#3',
        'A3',
        'G#3',
        'G3',
        'F#3',
        'F3',
        'E3',
        'D#3',
        'D3',
        'C#3',
        'C3'
    ]
    let innerWidth
    let columnDuration = '16n'

    /**
    The NexusUI sequencer is polyphonic by default, so this hack will ensure that
    the user can only select one note per column in keeping with the monophony that
    Motivic currently supports
    * @param {number} column The matrix index of the selected column
    * @param {number} row The matrix index of the selected row
    */
    function validateMonophony(column, row) {
        let matrix = sequencer.matrix
        let pattern = matrix.pattern
        let allColVals = pattern.map(matrixRow => matrixRow[column])
        let allSelColVals = allColVals.filter(Boolean)
        let multiSelected = allSelColVals.length > 1
        if (multiSelected) {
            allColVals.forEach((val, rowIdx) => {
                if (val && rowIdx !== row) {
                    matrix.toggle.cell(column, rowIdx)
                }
            })
        }
    }

    async function playSequence(e) {
        let motif = getMotifFromGrid()
        let { column, row, state } = e
        let time = { [columnDuration]: column }
        let note = sequencerRows[row]

        if (state) {
            validateMonophony(column, row)
        }

        if (state) {
            synthPart.add(time, note)
        } else {
            synthPart.remove(time, note)
        }
    }

    function getNoteFromGrid(pitch, colIdx) {
        let value = null
        let octave = null
        let name = ''
        let pitchName = ''
        let startingBeat = colIdx * 16
        // sequencer is set up for each column represents a 16th note.
        let duration = 16
        if (!pitch) {
            // note is rest
            return {
                value,
                duration,
                name,
                octave,
                pitch: pitchName,
                startingBeat
            }
        }

        let pitchArr = pitch.split('')
        let octaveSplitIdx = pitchArr.findIndex(char => !isNaN(parseInt(char)))
        octave = parseInt(pitchArr.slice(octaveSplitIdx).join(''))
        name = pitchArr
            .slice(0, octaveSplitIdx)
            .join('')
            .toLowerCase()
        pitchName = pitch.toLowerCase()
        value = MotivicUtils.melody.getNoteValue(name, octave)
        return {
            value,
            duration,
            name,
            startingBeat,
            pitch: pitchName,
            octave
        }
    }

    /**
    transforms the sequencer matrix pattern from an array of rows to and array of columns
    */
    function getColumnarPattern(pattern) {
        let cols = pattern[0].length
        let newPattern = new Array(cols)
        for (let i = 0; i < cols; i++) {
            newPattern[i] = []
        }
        return pattern.reduce((newPattern, row, rowIdx, oldPattern) => {
            row.forEach((colVal, colIdx) => {
                newPattern[colIdx][rowIdx] = colVal
            })
            return newPattern
        }, newPattern)
    }

    function getMotifFromGrid() {
        let notes = []
        let pattern = getColumnarPattern(sequencer.matrix.pattern)
        // column-first iteration
        for (let col = 0; col < pattern.length; col++) {
            for (let row = 0; row < pattern[col].length; row++) {
                let pitch = pattern[col][row] ? sequencerRows[row] : null
                if (pitch) {
                    let note = getNoteFromGrid(pitch, col)
                    notes.push(note)
                }
            }
            if (!pattern[col].some(cell => cell)) {
                // if the entire column is empty, then add a rest note for that column
                let note = getNoteFromGrid(null, col)
                notes.push(note)
            }
        }
        return notes
    }

    /** parse a motif for display on the sequencer grid
     */
    function getGridPatternFromMotif(motif) {}

    function init() {
        effectMap = createEffects()
        synth = createInstrument()
        synthPart = createPart(synth)
        sequencerRows = getRows()
        let motif = motifs.length ? motifs[0] : null
        let gridConfig = getGridConfig(motif)
        sequencer = new Nexus.Sequencer('#sequencer', gridConfig)
        new Tone.Loop(time => {
            Tone.Draw.schedule(() => sequencer.next(), time)
        }, columnDuration).start()
        sequencer.on('change', playSequence)
    }

    function createInstrument() {
        let instrument = new Tone.Synth({ oscillator: { type: selectedVoice } })
        let filter = new Tone.Filter({ type: 'lowpass', frequency: 2000 })
        instrument.connect(filter)
        filter.toDestination()
        return instrument
    }

    function createPart(instrument) {
        let part = new Tone.Part((time, note) => {
            instrument.triggerAttackRelease(note, '4n', time)
        }, synthPattern).start()
        part.loop = true
        part.loopStart = 0
        // setting up a 1 measure loop
        part.loopEnd = '1m'
        return part
    }

    function createEffects() {
        effectMap.delay = new Tone.PingPongDelay('8n.', 0.3)
        effectMap.reverb = new Tone.Reverb({ decay: 3, wet: 0.5 })
        return effectMap
    }

    function getRows(motif) {
        // TODO: compute appropriate rows (array of notes in scientific pitch notation)
        // for playing a given motif.
        return defaultRows
    }

    function getColumns(motif) {
        // TODO: compute appropriate number of columns for a given motif
        // considering the default column duration (32nd note?),
        // the length of the motif
        return Config.rhythmicUnit / 4
    }

    function getGridSize(motif) {
        // TODO: dynamically compute grid size based on 1) viewport width 2) motif
        let gridDim = getGridDimensions()
        return [gridDim.width, gridDim.height]
    }

    function getGridDimensions() {
        let width = innerWidth * 0.9
        let height = width / 2
        return {
            width,
            height
        }
    }

    /**
     * Returns appropriate sequencer config from a motif or sane defaults if there is none.
     * @param {Object} motif Motif to play with sequencer
     * @returns {Object} Sequencer configuration
     */
    function getGridConfig(motif = null) {
        return {
            columns: getColumns(motif),
            rows: getRows(motif).length,
            size: getGridSize(motif),
            mode: 'toggle'
        }
    }

    function start() {
        new Tone.Loop(time => {
            Tone.Draw.schedule(() => sequencer.next(), time)
        }, '16n').start()
        let sequencerRows = []
        sequencer.on('change', playSequence)
    }

    function scriptLoaded(e) {
        console.log(`Tone.js loaded!`)
        console.dir(e)
    }

    function tempoInput(e) {
        let newBpm = +e.target.value
        Tone.Transport.bpm.value = newBpm
    }

    async function startLoop() {
        await Tone.start()
        Tone.Transport.start()
    }

    async function stopLoop() {
        Tone.Transport.stop()
    }
    function selectVoice(event) {
        selectedVoice = event.detail.selection
    }

    function volumeInput() {
        let newVolume = e.target.value
        selectedVolume = newVolume
    }

    function toggleReverb() {
        if (effectState.reverb) {
            // TODO: figure out how to disconnect the effect
        } else {
            synth.connect(effectMap.reverb)
            effectMap.reverb.toDestination()
        }
    }

    function toggleDelay() {
        if (effectState.delay) {
            // TODO: figure out how to disconnect the effect
        } else {
            synth.connect(effectMap.delay)
            effectMap.delay.toDestination()
        }
    }

    function resizeSequencer(e) {
        let { width, height } = getGridDimensions()
        sequencer.resize(width, height)
    }
</script>

<style>
    .controls {
        align-items: flex-start;
    }

    button {
        flex: 1 1 0;
        margin: 0 5px;
    }
    #sequencer {
        margin-top: 10px;
    }
</style>

<svelte:head>
    <!-- Have to import it this way due to a nested dependency mismatch  -->
    <script
        src="https://cdn.jsdelivr.net/npm/tone@14.7.39/build/Tone.min.js"
        on:load={init}>

    </script>
</svelte:head>
<svelte:window bind:innerWidth on:resize={resizeSequencer} />

<div class="controls">
    <DropDown
        id="voice-control"
        options={Config.audio.voices}
        displayCompact={false}
        disabled={false}
        optionIconMap={Config.waveformIconMap}
        on:updateSelection={selectVoice} />
    <label>
        volume
        <input
            id="volume"
            type="range"
            min="-50"
            max="50"
            value="0"
            on:input={volumeInput} />
    </label>

    <label>
        bpm
        <input
            id="bpm"
            type="range"
            min="30"
            max="300"
            value="120"
            on:input={tempoInput} />
    </label>
    <button id="start" on:click={startLoop}>start</button>
    <button id="stop" on:click={stopLoop}>stop</button>
    <button id="reverb" on:click={toggleReverb}>reverb</button>
    <button id="delay" on:click={toggleDelay}>delay</button>

</div>
<div id="sequencer" />
