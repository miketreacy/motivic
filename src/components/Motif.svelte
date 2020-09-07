<script>
    import { onMount, createEventDispatcher } from 'svelte'
    import Config from '../Config'
    import MotivicUtils from '../MotivicUtils'
    import AudioControls from './AudioControls.svelte'
    import CrudControls from './CrudControls.svelte'
    import DownloadControls from './DownloadControls.svelte'
    import ItemName from './ItemName.svelte'
    import MotifSettingsList from './MotifSettingsList.svelte'
    import NoteGrid from './NoteGrid.svelte'
    import Sequencer from './Sequencer.svelte'

    export let motif = null
    export let showNoteGrid = true
    const numberOfPitches = 12
    // let gridWidth
    let innerWidth = 375

    function getTransformations(motif) {
        return motif.transformations.reduce((map, { type, params }) => {
            map[type] = params.join(', ')
            return map
        }, {})
    }

    function toggleNoteGrid(e) {
        showNoteGrid = !showNoteGrid
    }

    // function getGridWidth(innerWidth) {
    //     return innerWidth - 20
    // }

    function getGridColumnsForMotif() {}

    function getGridRowsForMotif() {}

    function getRows(octaveMap, numberOfPitches) {
        return (octaveMap.high - octaveMap.low + 1) * numberOfPitches
    }

    function getTotalColumns(viewColumns, horizontalGrids) {
        return viewColumns * horizontalGrids
    }

    function getMotifGrids(motif, columns) {
        let totalDuration = motif.notes.reduce((sum, n) => sum + n.duration, 0)
        return totalDuration / columns
    }

    function getMotifColumns(motif) {
        // TODO: enforce a minimum number of columns
        // TODO: so motifs don't take too many horizontal grids to display
        // TODO: enforce a max number of columns relative to viewport width
        // TODO: so it's usable on small screens
        // find the smallest possible number of columns to display the motif with
        return Config.gridDisplayColumns.find(num =>
            motif.notes.every(
                n => n.duration % (Config.rhythmicUnit / num) === 0
            )
        )
    }

    function getViewColumns(motif) {
        if (motif) {
            return getMotifColumns(motif)
        }
        return Config.gridDisplayColumns
    }
    function getMotifOctaveMap(melody) {
        let melodyOctaves = melody.notes
            .filter(n => typeof n.octave === 'number')
            .map(n => n.octave)
        return {
            low: Math.min(...melodyOctaves),
            high: Math.max(...melodyOctaves)
        }
    }

    function getGridOctaveMap(motif) {
        if (motif) {
            return getMotifOctaveMap(motif)
        } else
            return {
                low: Config.gridDisplayOctaveLow,
                high: Config.gridDisplayOctaveHigh
            }
    }

    // onMount(() => {
    //     gridWidth = getGridWidth(innerWidth)
    // })
    // $: gridWidth = getGridWidth(innerWidth)
    $: gridOctaveMap = getGridOctaveMap(motif)
    $: viewColumns = getViewColumns(motif)
    $: horizontalGrids = getMotifGrids(motif, viewColumns)
    $: totalColumns = getTotalColumns(viewColumns, horizontalGrids)
    $: rows = getRows(gridOctaveMap, numberOfPitches)
</script>

<style>
    .motif-header {
        flex-direction: column;
        width: 67vw;
        position: relative;
    }
    .name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        justify-content: flex-start;
        text-align: left;
        width: 100%;
        max-width: calc(var(--max_main_width) - 140px);
    }
    .settings {
        flex-direction: column;
        width: 100%;
        padding: 10px;
    }
</style>

<svelte:window bind:innerWidth />
<section id="motif">
    <div class="motif-header">
        <h1 class="name">{motif.name}</h1>
        <div>{motif.id}</div>
    </div>
    <!-- TODO: assign uploaded motifs tempo, length, timeSignature, etc so I can expect these props to exist -->
    <div class="settings">

        <div class="motif-settings">
            <MotifSettingsList title="settings" settings={motif.meta} />
        </div>

        {#if motif.transformations && motif.transformations.length}
            <div class="transformations">
                <MotifSettingsList
                    title="transformations"
                    settings={getTransformations(motif)} />
            </div>
        {/if}
    </div>
    {#if showNoteGrid}
        <!-- <NoteGrid
            width={gridWidth}
            height={gridWidth}
            motifs={[motif]}
            on:displayToggle
            on:displayAlert
            on:displayCrudModal /> -->
        <Sequencer
            motifs={[motif]}
            columns={totalColumns}
            {rows}
            lowOctave={gridOctaveMap.low}
            highOctave={gridOctaveMap.high}
            on:displayToggle
            on:displayAlert
            on:displayCrudModal />
        <!-- <Sequencer
            motifs={[]}
            on:displayToggle
            on:displayAlert
            on:displayCrudModal /> -->
    {/if}
</section>
