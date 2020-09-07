<script>
    import { onMount, createEventDispatcher } from 'svelte'
    import Config from '../Config'
    import Nexus from 'nexusui'
    // can't import it this way because of a nested dependency export/import issue
    // import Tone from 'tone'
    import DropDown from './DropDown.svelte'
    import CrudControls from './CrudControls.svelte'
    import MotivicUtils from '../MotivicUtils'
    export let motifs = []
    export let columns = 16
    export let rows = 12
    export let highOctave = 4
    export let lowOctave = 4

    const numberOfPitches = 12
    const synthNoteColumnDivisor = 4
    let sequencer
    let synth
    let synthPattern = []
    let synthPart
    let selectedVoice = 'sine'
    let selectedVolume = 0
    let sequencerRows = []
    let isPlaying = false
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
    let columnDuration = 4
    let columnDurationString = '16n'
    let synthNoteDurationString = '4n'

    /**
    Gets the synth note duration relative to the column duration
    * @param {number} columnDuration The duration of one sequencer column in Motivic Atomic Rhythmic Units
    * @returns {string} A Tone.js tempo-relative value for note duration (Ex. '16n')
    */
    function getSynthNoteDurationString(columnDuration) {
        let note = Config.rhythmicUnit / columnDuration / synthNoteColumnDivisor
        return `${note}n`
    }

    /**
    Translates motivic atomic rhythmic units to Tone.js duration notation.
    Example: 4 MARU = '16n'
    * @param {number} columnDuration The duration of one sequencer column in Motivic Atomic Rhythmic Units
    * @returns {string} A Tone.js tempo-relative value for note duration (Ex. '16n')
    */
    function getColumnDurationString(columnDuration) {
        let note = Config.rhythmicUnit / columnDuration
        return `${note}n`
    }

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
        let { column, row, state } = e
        let time = { [columnDurationString]: column }
        let note = sequencerRows[row]

        if (state) {
            validateMonophony(column, row)
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
        let startingBeat = colIdx * columnDuration

        if (!pitch) {
            // note is rest
            return {
                value,
                duration: columnDuration,
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
            duration: columnDuration,
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

    /**
    Transforms a column-first matrix pattern into a row-first matrix
    */
    function getRowPattern(columnarPattern) {
        let rows = columnarPattern[0].length
        let newPattern = new Array(rows)
        for (let i = 0; i < rows; i++) {
            newPattern[i] = []
        }
        return columnarPattern.reduce((newPattern, col, colIdx, oldPattern) => {
            col.forEach((rowVal, rowIdx) => {
                newPattern[rowIdx][colIdx] = rowVal
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

    function getPitchRows(motif) {
        // TODO: compute appropriate rows (array of notes in scientific pitch notation)
        // for playing a given motif.
        return defaultRows
    }

    function init() {
        effectMap = createEffects()
        synth = createInstrument(selectedVoice)
        synthPart = createPart(synth)
        sequencerRows = getPitchRows(motif)
        let gridConfig = getGridConfig(motif)
        sequencer = new Nexus.Sequencer('#sequencer', gridConfig)
        if (motif) {
            let pattern = getGridPatternFromMotif(motif)
            console.info(`motif pattern`)
            console.dir(pattern)
            sequencer.matrix.pattern = pattern
        }
        new Tone.Loop(time => {
            Tone.Draw.schedule(() => sequencer.next(), time)
        }, columnDurationString).start()
        sequencer.on('change', playSequence)
        console.dir(sequencer)
    }

    function createInstrument(voice) {
        let instrument = new Tone.Synth({ oscillator: { type: voice } })
        let filter = new Tone.Filter({ type: 'lowpass', frequency: 2000 })
        instrument.connect(filter)
        filter.toDestination()
        return instrument
    }

    function createPart(instrument) {
        let part = new Tone.Part((time, note) => {
            instrument.triggerAttackRelease(note, synthNoteDurationString, time)
        }, synthPattern).start()
        part.loop = true
        part.loopStart = 0
        // setting up a 1 measure loop
        part.loopEnd = '1m'
        return part
    }

    function createEffects() {
        effectMap.delay = new Tone.PingPongDelay('16n', 0.5)
        effectMap.reverb = new Tone.Reverb({ decay: 3, wet: 0.5 })
        return effectMap
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
        const maxGridWith = 540
        const rowFactor = rows / 12
        let widthFactor = innerWidth > 768 ? 0.9 : 1
        let heightDivisor = innerWidth > 768 ? 2 : 1.5
        let width = Math.min(innerWidth * widthFactor, maxGridWith)
        let height = (width / heightDivisor) * rowFactor
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
            columns,
            rows,
            size: getGridSize(motif),
            mode: 'toggle'
        }
    }

    function tempoInput(e) {
        let newBpm = +e.target.value
        Tone.Transport.bpm.value = newBpm
    }

    async function startLoop() {
        await Tone.start()
        Tone.Transport.start()
    }

    async function pauseLoop() {
        Tone.Transport.pause()
    }

    async function stopLoop() {
        Tone.Transport.stop()
    }

    async function toggleLoop() {
        if (isPlaying) {
            isPlaying = false
            pauseLoop()
        } else {
            isPlaying = true
            startLoop()
        }
    }

    async function resetLoop() {
        Tone.Transport.stop()
        let matrix = sequencer.matrix
        matrix.populate.all(0)
        sequencer.stepper.value = 0
    }

    function selectVoice(event) {
        selectedVoice = event.detail.selection
    }

    function volumeInput() {
        let newVolume = e.target.value
        selectedVolume = newVolume
    }

    function toggleEffect(effectName) {
        if (effectState[effectName]) {
            synth.disconnect(effectMap[effectName])
            effectState[effectName] = false
        } else {
            synth.connect(effectMap[effectName])
            effectMap[effectName].toDestination()
            effectState[effectName] = true
        }
    }

    function toggleReverb() {
        return toggleEffect('reverb')
    }

    function toggleDelay() {
        return toggleEffect('delay')
    }

    function resizeSequencer(e) {
        if (!sequencer) {
            return
        }
        let { width, height } = getGridDimensions()
        sequencer.resize(width, height)
    }

    function getMotifToSave() {
        return getMotifFromGrid() || null
    }

    function getRowIndexFromMotifNote(note) {
        // TODO: write this
        return 0
    }

    function getNoteValueRowMap(rows, pitchSet) {
        let pitches = pitchSet.slice().reverse()
        // match note.value to row
        let noteValueRowMap = MotivicUtils.general
            .range(rows, 1)
            .reduce((map, row, idx) => {
                let note = pitches[idx]
                map[note.value] = row
                return map
            }, {})
        console.log(`noteValueRowMap`, noteValueRowMap)
        return noteValueRowMap
    }

    function getRowByNoteValue(noteValue) {
        let minVal = Math.min(...Object.keys(noteValueRowMap))
        let maxVal = Math.max(...Object.keys(noteValueRowMap))
        let tooBig = noteValue > maxVal
        let tooSmall = noteValue < minVal

        if (!tooBig && !tooSmall) {
            return noteValueRowMap[noteValue]
        }

        // noteValue is out of range for grid
        if (tooBig) {
            console.log(`tooBig: ${noteValue}`)
            while (noteValue > maxVal) {
                noteValue = noteValue - 12
            }
            console.log(`tooBig - fixed: ${noteValue}`)
            return noteValueRowMap[noteValue]
        }

        if (tooSmall) {
            console.log(`tooSmall: ${noteValue}`)
            while (noteValue < maxVal) {
                noteValue = noteValue + 12
            }
            console.log(`tooSmall - fixed: ${noteValue}`)
            return noteValueRowMap[noteValue]
        }
    }

    /** parse a motif for display on the sequencer grid
     */
    function getGridPatternFromMotif(motif) {
        let newPattern = new Array(columns)
        for (let i = 0; i < columns; i++) {
            newPattern[i] = new Array(rows).fill(false)
        }
        // let columnsLeft = columns
        // while (columnsLeft) {}
        let columnarPattern = motif.notes.reduce((matrix, note) => {
            if (note.value) {
                let cols = note.duration / columnDuration
                // let rowIdx = getRowIndexFromMotifNote(note)
                let rowIdx = getRowByNoteValue(note.value)
                console.info(`note value: ${note.value} row: ${rowIdx}`)
                for (let colIdx = 0; colIdx < cols; colIdx++) {
                    matrix[colIdx][rowIdx] = true
                }
            }
            return matrix
        }, newPattern)
        return getRowPattern(columnarPattern)
    }

    $: motif = motifs[0]
    $: pitchSet = MotivicUtils.melody.getPitchSet(lowOctave, highOctave)
    $: noteValueRowMap = getNoteValueRowMap(rows, pitchSet)
    $: synth = window.Tone ? createInstrument(selectedVoice) : synth
    $: synthPart = window.Tone ? createPart(synth) : synthPart
    $: columnDurationString = getColumnDurationString(columnDuration)
    $: synthNoteDurationString = getSynthNoteDurationString(columnDuration)
</script>

<style>
    .controls {
        align-items: flex-start;
        flex-direction: column;
    }

    .row {
        padding: 5px 0;
    }
    .transport {
        width: 100%;
        justify-content: space-between;
    }
    .transport button {
        width: 20%;
    }
    .toggle-field {
        margin: 0 10px;
    }
    .toggle-field label {
        margin-right: 5px;
    }

    input {
        font-size: var(--theme_font_size_1);
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

<div class="wrap">
    <div class="controls">
        <div class="row">
            <DropDown
                id="voice-control"
                options={Config.audio.voices}
                displayCompact={false}
                disabled={false}
                optionIconMap={Config.waveformIconMap}
                on:updateSelection={selectVoice} />
            <div class="toggle-field">
                <label for="reverb">reverb</label>
                <input id="reverb" type="checkbox" on:change={toggleReverb} />
            </div>
            <div class="toggle-field">
                <label for="delay">delay</label>
                <input id="delay" type="checkbox" on:change={toggleDelay} />
            </div>
        </div>

        <div class="row">
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
        </div>

        <div class="row transport">
            <button on:click={toggleLoop}>&#9658;&#10074;&#10074;</button>
            <button id="clear" on:click={resetLoop}>reset</button>
            <CrudControls
                displayIcons={false}
                displayCompact={true}
                type="motifs"
                saveMode="local"
                selectedItems={[motifs[0]]}
                on:displayCrudModal />
        </div>

    </div>
    <div id="sequencer" />
</div>
