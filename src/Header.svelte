<script>
    import { createEventDispatcher } from 'svelte'
    import Utils from './Utils'
    import Nav from './Nav.svelte'
    import Field from './Field.svelte'
    export let showNav = false
    export let showUpload = false
    export let motifs = []
    export let openSection = ''
    export let scrollDown
    let fullDisplay = true
    const dispatch = createEventDispatcher()
    const fileUploadField = {
        type: 'file',
        id: 'upload',
        label: 'Upload file (MIDI or JSON)',
        accept: '.json, .midi, .mid',
        wrap: false
    }
    let motifListOpen = false
    function toggleNavMenu() {
        showNav = !showNav
        if (showNav) {
            showUpload = false
        }
    }
    function toggleUploadMenu() {
        showUpload = !showUpload
        if (showUpload) {
            showNav = false
        }
    }

    function handleUploadMenuClickAway(e) {
        if (
            !e.target.closest('#upload-toggle') &&
            !e.target.closest('.upload-controls')
        ) {
            showUpload = false
        }
    }

    function handleUploadedMotifs(results) {
        showUpload = false
        results.forEach(result => {
            let [success, msg, motif] = result
            dispatch('displayAlert', {
                visible: true,
                type: success ? 'success' : 'error',
                message: msg,
                displayTimeMs: 1500,
                dismissable: false
            })
        })
    }
    function uploadFile(event) {
        console.log(`uploadFile() called`)
        console.dir(event.detail)
        let files = event.detail.value
        let file = files[0]
        let reader = new FileReader()
        let fileName = file.name.split('.')[0]
        let fileType = file.name.split('.')[1]
        if (fileType === 'json') {
            reader.addEventListener(
                'load',
                Utils.file.json.uploadHandler(fileName, handleUploadedMotifs)
            )
            reader.readAsText(file)
        } else if (fileType === 'midi' || fileType === 'mid') {
            reader.addEventListener(
                'load',
                Utils.file.midi.uploadHandler(fileName, handleUploadedMotifs)
            )
            reader.readAsDataURL(file)
        }
    }

    function toggleMotifList(e) {
        if (motifs.length) {
            motifListOpen = !motifListOpen
            dispatch('displayToggle', {
                section: 'motifs',
                open: motifListOpen
            })
        }
    }

    function loadHomeView(e) {
        dispatch('displayToggle', { section: '', open: false })
    }

    $: motifListOpen = openSection === 'motifs'
    $: fullDisplay = openSection === ''
</script>

<style>
    :root {
        --layout_desktop_width: 1025px;
    }
    header {
        box-sizing: border-box;
        display: flex;
        z-index: var(--middle);
        background-color: var(--theme_color_4);
        position: fixed;
        width: 100vw;
        z-index: var(--middle);
        padding: 10px 0;
        flex-direction: column;
        min-width: inherit;
        align-items: center;
    }
    header.compact {
        border: none;
        background-color: initial;
    }
    .wrap {
        height: 40px;
        width: 100%;
        max-width: var(--max_main_width);
        padding: 0 10px;
        position: relative;
        flex-direction: row;
        justify-content: space-between;
    }

    h1 {
        flex: 1 1 0;
    }

    button {
        max-width: 40px;
    }

    .button-wrap.left {
        left: 10px;
    }
    .button-wrap.right {
        right: 10px;
    }
    button.home {
        /* background-image: url("./images/favicon_144.svg"); */
        position: relative;
    }

    button.home img {
        width: 40px;
        position: absolute;
        border-radius: 5px;
    }

    #motifs {
        flex-direction: row;
        right: 10px;
        top: 10px;
    }
    #motifs.small {
        flex-direction: column;
    }

    .motif-count {
        font-size: var(--theme_font_size_2);
        padding-left: 2px;
    }

    .motif-count.small {
        padding-left: 0;
    }

    header.scrolldown {
        padding: 0px;
        border-bottom: none;
    }

    header.scrolldown h1,
    header.scrolldown button {
        display: none;
    }

    .subtitle {
        font-style: italic;
        display: none;
    }

    .subtitle .icons {
        font-style: normal;
        padding: 0 10px;
    }
    /* Tablet */
    @media (min-width: 768px) {
        .button-wrap.left {
            left: 30vw;
        }
        .button-wrap.right {
            right: 30vw;
        }
    }

    /*Desktop*/
    @media (min-width: 1025px) {
        header.scrolldown h1,
        header.scrolldown button {
            display: flex;
        }

        .subtitle {
            display: flex;
            padding-top: 10px;
        }
    }
</style>

<header class="show" class:scrolldown={scrollDown} class:compact={!fullDisplay}>
    <div class="wrap">
        {#if openSection}
            <div class="button-wrap left">
                <button class="home" on:click={loadHomeView}>
                    <!-- <span>&#127968;</span> -->
                    <img
                        alt="home"
                        src="./images/favicon_144_white_on_blue.svg" />
                </button>
            </div>
        {/if}

        {#if fullDisplay}
            <h1>
                <a href="/">Motivic</a>
            </h1>
        {/if}
        {#if motifs.length}
            <div class="button-wrap right">
                <button
                    id="motifs"
                    on:click={toggleMotifList}
                    class:small={motifs.length > 9}>
                    {#if motifs.length < 10}
                        <span>&#9835;</span>
                    {/if}
                    <span class="motif-count" class:small={motifs.length > 9}>
                        {motifs.length}
                    </span>
                </button>
            </div>
        {/if}
    </div>
    {#if fullDisplay}
        <p class="subtitle">
            <span class="icons">&#9836;</span>
            tools for composers
            <span class="icons">&#9836;</span>
        </p>
    {/if}
</header>
