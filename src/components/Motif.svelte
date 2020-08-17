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
    let gridWidth
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

    function getGridWidth(innerWidth) {
        return innerWidth - 20
    }

    onMount(() => {
        gridWidth = getGridWidth(innerWidth)
    })
    $: gridWidth = getGridWidth(innerWidth)
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
            on:displayToggle
            on:displayAlert
            on:displayCrudModal />
    {/if}
</section>
