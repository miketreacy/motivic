<script>
    import Alert from './Alert.svelte'
    import About from './About.svelte'
    import UploaderForm from './UploaderForm.svelte'
    import RandomizerForm from './RandomizerForm.svelte'
    import TransformerForm from './TransformerForm.svelte'
    import MotifList from './MotifList.svelte'
    import SettingsList from './SettingsList.svelte'
    import Motif from './Motif.svelte'
    import AudioInput from './AudioInput.svelte'

    export let selectedMotifIds = []
    export let allSelected = false
    export let view = ''
    export let openSection = ''
    export let openItemId = ''
    export let motifs = []
    export let settings = []
    export let scrollDown = false
    export let fileDownloading = false
    let viewType = 'flat'
    let sortType = 'created'
    let sortOrder = 'desc'
    let expandedMotifId = ''
    const defaultShowSectionMap = {
        motif: '',
        motifs: false,
        uploader: true,
        randomizer: true,
        transformer: true
    }
    let showSectionMap = Object.assign({}, defaultShowSectionMap)

    export let displayAlert = false
    export let alertProps = {
        visible: false,
        message: '',
        type: '',
        displayTimeMs: 0,
        dismissable: false,
        top: 0,
        displayLabel: true
    }

    function updateDisplayState(openSection, openItemId) {
        if (openSection) {
            showSectionMap = Object.keys(showSectionMap).reduce((obj, key) => {
                obj[key] = key === openSection
                return obj
            }, {})
        } else {
            showSectionMap = Object.assign({}, defaultShowSectionMap)
        }
    }
    function handleDisplayAlert(event) {
        alertProps = event.detail
        displayAlert = alertProps.visible
    }

    function handleListViewChange(event) {
        viewType = event.detail.viewType
        sortType = event.detail.sortType
        sortOrder = event.detail.sortOrder
        // Only expand the motif when the expandedMotifId value changes explicitly,
        // otherwise close the expanded motif on all other list-view event types.
        expandedMotifId =
            event.detail.expandedMotifId === expandedMotifId
                ? ''
                : event.detail.expandedMotifId
        motifs = motifs
        console.info(`handleListViewChange() called`)
        console.info(`viewType = ${viewType}`)
        console.info(`sortType = ${sortType}`)
        console.info(`sortOrder = ${sortOrder}`)
        console.info(`expandedMotifId = ${expandedMotifId}`)
    }

    $: updateDisplayState(openSection, openItemId)
    $: openSection =
        openSection === 'motifs' && !motifs.length ? '' : openSection
</script>

<style>
    main {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        background-color: var(--theme_color_2);
        position: relative;
        padding: 10px;
        width: 100%;
        max-width: var(--max_main_width);
        align-items: center;
        justify-content: center;
    }
    #tools-wrap {
        width: 100%;
        margin-top: 0vh;
        max-width: var(--layout_mobile_width);
    }
    #tools-wrap.closed {
        margin-top: var(--header_offset);
        padding: 20px;
    }
</style>

<main>
    {#if displayAlert}
        <Alert {...alertProps} on:displayAlert={handleDisplayAlert} />
    {/if}

    <!-- audio is an experimental route TODO: put this somewhere else in the future -->
    {#if view === 'audio'}
        <div id="tools-wrap" class:closed={openSection === ''}>
            <AudioInput />
        </div>
    {/if}
    {#if view === 'about'}
        <About />
    {/if}
    {#if view === 'home'}
        <div id="tools-wrap" class:closed={openSection === ''}>
            {#if showSectionMap.motif && openItemId}
                <Motif
                    motif={motifs.find(m => m.id === openItemId)}
                    on:displayToggle
                    on:displayAlert={handleDisplayAlert}
                    on:displayCrudModal />
            {/if}
            {#if showSectionMap.motifs}
                <MotifList
                    id="motifs"
                    title="My Motifs"
                    listOpen={openSection === 'motifs'}
                    {motifs}
                    {selectedMotifIds}
                    {allSelected}
                    parentId=""
                    {viewType}
                    {sortType}
                    {sortOrder}
                    {expandedMotifId}
                    {scrollDown}
                    {fileDownloading}
                    on:listViewChange={handleListViewChange}
                    on:displayToggle
                    on:displayCrudModal
                    on:motifSelection
                    on:displayAlert={handleDisplayAlert}
                    on:downloadFile />
            {/if}
            {#if showSectionMap.settings}
                <SettingsList
                    id="settings"
                    title="My Settings"
                    listOpen={openSection === 'settings'}
                    {motifs}
                    {selectedMotifIds}
                    {allSelected}
                    {viewType}
                    {sortType}
                    {sortOrder}
                    {expandedMotifId}
                    {scrollDown}
                    {fileDownloading}
                    on:listViewChange={handleListViewChange}
                    on:displayToggle
                    on:displayCrudModal
                    on:motifSelection
                    on:displayAlert={handleDisplayAlert}
                    on:downloadFile />
            {/if}
            {#if showSectionMap.randomizer}
                <RandomizerForm
                    formOpen={openSection === 'randomizer'}
                    {motifs}
                    {settings}
                    {scrollDown}
                    on:displayToggle
                    on:displayAlert={handleDisplayAlert}
                    on:displayCrudModal />
            {/if}
            {#if showSectionMap.uploader}
                <UploaderForm
                    formOpen={openSection === 'uploader'}
                    on:displayToggle
                    on:displayAlert={handleDisplayAlert}
                    on:displayCrudModal />
            {/if}
            {#if showSectionMap.transformer && motifs.length}
                <TransformerForm
                    formOpen={openSection === 'transformer'}
                    {motifs}
                    {settings}
                    {scrollDown}
                    selectedMotifId={motifs.length ? motifs[0].id : ''}
                    on:displayToggle
                    on:displayAlert={handleDisplayAlert}
                    on:displayCrudModal />
            {/if}
        </div>
    {/if}
</main>
