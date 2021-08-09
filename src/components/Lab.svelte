<script>
    import { labGrid, initLabGrid } from '../stores/GridState.js'
    import LabGrid from './LabGrid.svelte'
    import LabPalette from './LabPalette.svelte'
    import MotifList from './MotifList.svelte'
    import ItemSelector from './ItemSelector.svelte'

    export let open = false
    export let motifs = []

    const formId = 'lab'
    let motifListOpen = true
    let numMotifLengthsToDisplayInRow = 4
    // $labGrid = initLabGrid()

    function cellChangeHander(event) {
        const data = event.detail
        console.info(
            `cellChangeHandler() called! on ${data.type} id: ${data.id} at row: ${data.row} column: ${data.column}`
        )
        labGrid.updateCell(data.row, data.column, data.id)
    }

    function laneChangeHandler(event) {
        const { add, lanes } = event.data
        console.info(
            `laneChangeHandler() called to ${
                add ? 'add' : 'remove'
            } ${lanes} lane${lanes > 1 ? 's' : ''}`
        )
        if (add) {
            labGrid.addRows(lanes)
        } else {
            labGrid.removeRows(lanes)
        }
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
        stateUpdaterFn={labGrid.updateCell}
        on:cellChange={cellChangeHander}
    />
{/if}

<style></style>
