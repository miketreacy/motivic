<script>
    import { createEventDispatcher } from 'svelte'
    import { motifStore, settingStore } from './Stores.js'
    import Config from './Config.js'
    import Utils from './Utils.js'
    import Header from './Header.svelte'
    import Main from './Main.svelte'
    import Footer from './Footer.svelte'
    import Modal from './Modal.svelte'
    import ItemCrudModal from './ItemCrudModal.svelte'

    export let view = ''
    export let openSection = ''

    const dispatch = createEventDispatcher()
    let motifs = []
    let selectedMotifIds
    let allSelected
    let settings = []
    let modalProps = Object.assign({}, Config.itemCrudModalDefaultProps)
    let displayAlert = false
    let fileDownloading = false
    let alertProps = {
        visible: false,
        message: '',
        type: '',
        displayTimeMs: 0,
        dismissable: false,
        top: 0,
        displayLabel: true
    }
    let scrollPos
    let scrollDown = false
    let scrollUp = true
    let openItemId = ''

    /**
     * Updates user data in memory in the global MOTIVIC namespace and in the component waterfall
     */
    function updateGlobalUserData(items, type) {
        let initGlobal = window[Config.nameSpace] || {
            user: { motifs: [], settings: [] },
            lib: { utils: Utils }
        }
        initGlobal.user[type] = items
        window[Config.nameSpace] = initGlobal
        if (type === 'motifs') {
            motifs = items
        }
        if (type === 'settings') {
            settings = items
        }
    }

    function handleDisplayToggle(event) {
        console.log(`handleDisplayToggle() called`)
        console.dir(event.detail)
        let { section, open, id } = event.detail
        if (open) {
            openSection = section
        } else {
            openSection = ''
        }
        openItemId = id || ''
    }

    function handleMotifSelection(event) {
        let { existingIds, newIds, add } = event.detail

        if (add) {
            selectedMotifIds = Utils.general.unique([...existingIds, ...newIds])
        } else {
            selectedMotifIds = existingIds.filter(id => !newIds.includes(id))
        }
    }

    function handleModalDisplay(event) {
        console.log(`handleModalDisplay() called (App.svelte)`)
        console.dir(event.detail)
        modalProps = Object.assign(modalProps, event.detail.modalProps)
        // de-select everything when modal is displayed
        selectedMotifIds = []
    }

    function handleViewChange(event) {
        view = event.detail.view
    }

    function handleDisplayAlert(event) {
        console.log(`handleDisplayAlert() called`)
        console.dir(event.detail)
        alertProps = event.detail
        displayAlert = alertProps.visible
    }
    function handleDownloadFile(event) {
        let { type, progress, items } = event.detail
        console.info(`fileDownload event fired: ${type} ${progress}%`)
        if (progress < 100) {
            fileDownloading = true
            Utils.file[type].download.bind(Utils.file[type])(items)
        } else {
            fileDownloading = false
        }
    }

    function scrollHandler(scrollPos) {
        let threshold = 30
        scrollDown = scrollPos >= threshold
        scrollUp = scrollPos < threshold
        console.info(`scrollPos = ${scrollPos}`)
        console.info(`scrollDown = ${scrollDown}`)
        console.info(`scrollUp = ${scrollUp}`)
    }

    function handleEmptyMotifList(motifs) {
        if (openSection === 'motifs' && !motifs.length) {
            handleDisplayToggle({ detail: { section: '', open: false } })
        }
    }

    $: updateGlobalUserData($motifStore, 'motifs')
    $: updateGlobalUserData($settingStore, 'settings')
    $: scrollHandler(scrollPos)
    $: handleEmptyMotifList(motifs)
</script>

<style>

</style>

<svelte:window bind:scrollY={scrollPos} />

<Header
    {view}
    {motifs}
    {openSection}
    {scrollDown}
    on:viewChange={handleViewChange}
    on:displayToggle={handleDisplayToggle}
    on:displayAlert={handleDisplayAlert} />

<Main
    {view}
    {motifs}
    {openSection}
    {openItemId}
    {allSelected}
    {selectedMotifIds}
    {settings}
    {displayAlert}
    {alertProps}
    {scrollDown}
    {fileDownloading}
    on:displayToggle={handleDisplayToggle}
    on:displayCrudModal={handleModalDisplay}
    on:motifSelection={handleMotifSelection}
    on:downloadFile={handleDownloadFile} />
{#if openSection === ''}
    <Footer />
{/if}
{#if modalProps.show}
    <!-- TODO: mount empty Modal here but mount the child content components separately to preserve modal fade in but keep form state clearn -->
    <ItemCrudModal
        {...modalProps}
        on:displayCrudModal={handleModalDisplay}
        on:displayAlert={handleDisplayAlert} />
{/if}
