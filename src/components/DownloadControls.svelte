<script>
    import { createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    import MotivicUtils from '../MotivicUtils'
    import Config from '../Config'
    import Input from './Input.svelte'
    import DropDown from './DropDown.svelte'

    export let selectedMotifs = []
    export let loading = false

    console.info(`DownloadControls.loading = ${loading}`)
    let fileType = 'wav'
    let selectedVoice
    let displayVoiceSelector

    const dispatch = createEventDispatcher()

    const waveFormIconMap = {
        sawtooth: '&#8961',
        sine: '&#8767;',
        square: '&#9633;',
        triangle: '&#9651;',
    }

    function downloadFile(e) {
        dispatch('downloadFile', {
            type: fileType,
            progress: 0,
            items: selectedMotifs,
            voice: selectedVoice,
        })
    }
    function selectVoice(event) {
        selectedVoice = event.detail.selection
    }
    function selectFileType(event) {
        fileType = event.detail.selection
    }

    $: displayVoiceSelector = fileType === 'wav'
</script>

<div
    class="download-controls"
    class:disabled={loading}
    class:sub-menu={displayVoiceSelector}
>
    <!-- <select bind:value={fileType}>
        {#each Config.downloadFileTypes as fileType}
            <option>{fileType}</option>
        {/each}
    </select> -->
    <DropDown
        id="file-type"
        options={Config.downloadFileTypes}
        displayCompact={true}
        displayVeryCompact={displayVoiceSelector}
        disabled={false}
        multiDim={false}
        on:updateSelection={selectFileType}
    />
    {#if displayVoiceSelector}
        <DropDown
            id="voice-control"
            options={Config.audio.voices}
            displayCompact={true}
            displayVeryCompact={displayVoiceSelector}
            disabled={false}
            optionIconMap={waveFormIconMap}
            on:updateSelection={selectVoice}
        />
    {/if}
    <button disabled={loading} on:click={downloadFile}>
        {#if loading}
            <div class="spinner" transition:fade class:disabled={loading} />
        {:else}
            <span>&#8681;</span>
        {/if}
    </button>
</div>

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

    .sub-menu > button {
        max-width: 45px;
    }
</style>
