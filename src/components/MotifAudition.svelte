<script>
    import { createEventDispatcher } from 'svelte'
    import { fade, fly } from 'svelte/transition'
    import AudioControls from './AudioControls.svelte'
    import CrudControls from './CrudControls.svelte'
    export let motif
    export let midiOutput = null
    export let playOnMount = false

    const dispatch = createEventDispatcher()

    function dismissAudition() {
        dispatch('toggleMotifAudition', { motif: null })
    }
</script>

<div
    class="motif-audition"
    in:fly|local={{ x: -200, duration: 1000 }}
    out:fly|local={{ x: 200, duration: 1000 }}
>
    <div class="new-motif">
        <span>audition:</span>
        <span class="motif-name">{motif.name}</span>
        <button class="dismiss" on:click={dismissAudition}>X</button>
    </div>

    <div class="motif-controls">
        <AudioControls
            displayIcons={false}
            displayCompact={true}
            selectedMotifs={[motif]}
            {midiOutput}
            {playOnMount}
            on:displayAlert
        />
        <CrudControls
            displayIcons={false}
            displayCompact={true}
            type="motifs"
            saveMode="local"
            selectedItems={[motif]}
            on:displayCrudModal
        />
    </div>
</div>

<style>
    .motif-audition {
        position: relative;
        padding: 10px;
        background-color: var(--theme_color_4);
        border-radius: 5px;
    }
    .new-motif {
        height: 45px;
        color: var(--theme_color_6);
    }
    .motif-name {
        padding-left: 5px;
        font-style: italic;
        font-weight: bold;
        color: var(--theme_color_3);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        max-width: 160px;
        min-width: 100%;
    }
    .dismiss {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
    }

    .motif-controls {
        justify-content: space-between;
    }
</style>
