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
    <LabGrid state={$labGrid} />
{/if}

<style></style>
