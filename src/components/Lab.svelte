<script>
    import LabBlock from './LabBlock.svelte'
    import LabTrack from './LabTrack.svelte'
    import LabLane from './LabLane.svelte'
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
    <!-- <MotifList
        id="motifs"
        title="My Motifs"
        listOpen={motifListOpen}
        {motifs}
        parentId=""
        viewType="flat"
        on:listViewChange
        on:displayToggle
        on:displayCrudModal
        on:motifSelection
        on:displayAlert
        on:downloadFile
    /> -->
    {#if motifs.length}
        <ItemSelector
            {formId}
            itemGroups={[{ type: 'motif', label: 'motifs', items: motifs }]}
            itemType="motifs"
            selectedItemId={selectedMotifId}
            defaultSelection={null}
            on:itemSelection
            on:displayAlert
        />
    {/if}
    <LabPalette />
    <LabBlock />
    <LabTrack />
    <LabLane />
{/if}

<style></style>
