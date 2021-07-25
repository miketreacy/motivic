<script>
    import LabBlock from './LabBlock.svelte'
    import LabTrack from './LabTrack.svelte'
    import LabLane from './LabLane.svelte'
    import LabPalette from './LabPalette.svelte'

    export let open = false
    export let motifs = []
</script>

{#if open}
    <div id="lab" />
    <LabPalette />
    <LabBlock />
    <LabTrack />
    <LabLane />
{/if}

<style></style>
