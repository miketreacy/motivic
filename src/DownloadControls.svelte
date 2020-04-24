<script>
    import { createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    import Utils from './Utils.js'
    import Config from './Config.js'
    import Input from './Input.svelte'
    export let selectedMotifs = []
    export let loading
    let fileType

    const dispatch = createEventDispatcher()

    function downloadFile(e) {
        dispatch('downloadFile', {
            type: fileType,
            progress: 0,
            items: selectedMotifs
        })
    }
</script>

<style>
    div {
        width: 100%;
        border-radius: 5px;
        background-color: var(--theme_color_1);
    }
    div.disabled {
        background-color: var(--theme_color_4);
    }
    button {
        flex-direction: column;
        flex: 1 1 0;
        width: 100%;
        font-size: var(--theme_font_size_3);
    }
    select {
        flex: 1 1 0;
        width: 100%;
        font-size: var(--theme_font_size_2);
    }
</style>

<div class="download-controls" class:disabled={loading}>
    <select bind:value={fileType}>
        {#each Config.downloadFileTypes as fileType}
            <option>{fileType}</option>
        {/each}
    </select>
    <button disabled={loading} on:click={downloadFile}>
        {#if loading}
            <div class="spinner" transition:fade class:disabled={loading} />
        {:else}
            <span>&#8681;</span>
        {/if}
    </button>
</div>
