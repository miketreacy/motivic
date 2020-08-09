<script>
    import Config from '../Config'
    import Nexus from 'nexusui'
    import Tone from 'tone'
    export let columnCount = 32
    export let rows = []
    export let motif = null

    let sequencer
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

    function init(gridConfig) {
        sequencer = new Nexus.Sequencer('#sequencer', {
            columns: numCols,
            rows: numRows,
            size: [550, 200]
        })
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
        return Config.rhythmicUnit / 2
    }

    function getGridSize(motif) {
        // TODO: dynamically compute grid size based on 1) viewport width 2) motif
        return [550, 200]
    }

    /**
     * Returns appropriate sequencer config from a motif or sane defaults if there is none.
     * @param {Object} motif Motif to play with sequencer
     * @returns {Object} Sequencer configuration
     */
    function getGridConfig(motif = null) {
        return {
            columns: getColumns(motif),
            rows: getRows(motif),
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

    async function playSequence(e) {
        console.table(e)
        // let input = {
        //     notes: [],
        //     totalQuantizedSteps: 32,
        //     quantizationInfo: { stepsPerQuarter: 4 }
        // }
        // let pattern = sequencer.matrix.pattern
        // for (let row = 0; row < pattern.length; row++) {
        //     for (let col = 0; col < pattern[row].length; col++) {
        //         if (pattern[row][col]) {
        //             input.notes.push({
        //                 quantizedStartStep: col,
        //                 quantizedEndStep: col + 2,
        //                 pitch: Tone.Frequency(sequencerRows[row]).toMidi()
        //             })
        //         }
        //     }
        // }
        // console.log(input)
    }

    onMount(() => {
        let gridConfig = getGridConfig(motif)
        init(gridConfig)
    })

    // $: visualize(AudioSession.ctx, AudioSession.stream, canvas)
</script>

<style>

</style>

<div id="sequencer" />
