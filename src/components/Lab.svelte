<script>
    import { labGrid } from '../stores/GridState.js'
    import LabGrid from './LabGrid.svelte'
    import LabPalette from './LabPalette.svelte'
    import MotifList from './MotifList.svelte'
    import ItemSelector from './ItemSelector.svelte'

    export let open = false
    export let motifs = []
    export let selectedMotifId = ''

    const formId = 'lab'
    let motifListOpen = true
    let numMotifLengthsToDisplayInRow = 4

    function cellChangeHander(event) {
        const data = event.detail
        console.info(
            `cellChangeHandler() called! on ${data.type} id: ${data.id} at row: ${data.row} column: ${data.column}`
        )
        labGrid.updateGridCell(data.row, data.column, data.id)
    }
</script>

{#if open}
    {#if motifs.length}
        <MotifList
            id="motifs"
            title="My Motifs"
            listOpen={motifListOpen}
            {motifs}
            parentId=""
            viewType="flat"
            draggable="true"
            on:listViewChange
            on:displayToggle
            on:displayCrudModal
            on:motifSelection
            on:displayAlert
            on:downloadFile
        />
        <!-- <ItemSelector
            {formId}
            itemGroups={[{ type: 'motif', label: 'motifs', items: motifs }]}
            itemType="motifs"
            selectedItemId={selectedMotifId}
            defaultSelection={null}
            on:itemSelection
            on:displayAlert
        /> -->
    {/if}
    <LabPalette />
    <LabGrid
        state={$labGrid}
        stateUpdaterFn={labGrid.updateGrid}
        on:cellChange={cellChangeHander}
    />
{/if}

<style></style>
