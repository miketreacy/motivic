<script>
    import { onMount } from 'svelte'
    import { createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    import Config from '../Config'
    import MotivicUtils from '../MotivicUtils'
    import CrudControls from './CrudControls.svelte'
    import DownloadControls from './DownloadControls.svelte'
    import ItemName from './ItemName.svelte'
    import MotifSettingsList from './MotifSettingsList.svelte'
    export let settings = []
    export let selectedSettings = []
    export let listOpen = false
    export let id = ''
    export let title = ''
    export let selectedSettingIds = []
    export let viewType
    export let parentId = ''
    export let sortType
    export let sortOrder
    export let expandedMotifId
    export let scrollDown = false
    export let fileDownloading = false
    const generationLevels = Config.motifGenerationDisplayCount
    const dispatch = createEventDispatcher()

    function toggleOpen(e) {
        console.log(`MotifList.toggleOpen() called listOpen=${listOpen}`)
        if (settings.length) {
            listOpen = !listOpen
            dispatch('displayToggle', { section: id, open: listOpen })
        }
    }

    function openMotifView(motifId) {
        console.log(`MotifList.openMotifView() called with ${motifId}`)
        dispatch('displayToggle', { section: 'motif', open: true, id: motifId })
    }

    function motifSelection(e) {
        let selectAll = e.target.id === 'select-all'
        let add = e.target.checked
        let newIds = selectAll ? settings.map(m => m.id) : [e.target.value]
        dispatch('motifSelection', {
            existingIds: selectedSettingIds,
            newIds,
            add
        })
    }

    function dispatchListViewChange(
        viewType,
        sortType,
        sortOrder,
        expandedMotifId
    ) {
        dispatch('listViewChange', {
            viewType,
            sortType,
            sortOrder,
            expandedMotifId
        })
    }

    function updateSelectedMotifIds(motifIds, add = true) {
        if (add) {
            return MotivicUtils.general.unique([
                ...selectedSettingIds,
                ...motifIds
            ])
        } else {
            return selectedSettingIds.filter(id => !motifIds.includes(id))
        }
    }

    function updateSelectedMotifs(ids) {
        console.log(`updateSelectedMotifs()called with ids: ${ids.join(',')}`)
        return ids.map(id => settings.find(m => m.id === id))
    }

    function motifSorter(key, order) {
        console.info(`motifSorter(${key}, ${order})`)
        if (key === 'created') {
            return MotivicUtils.general.objectKeySorterNum(key, order, ts =>
                new Date(ts).getTime()
            )
        } else {
            // assume key value is string
            return MotivicUtils.general.objectKeySorterAlpha(key, order)
        }
    }

    function dispatchDisplayModal(event) {
        let motif = settings.find(m => m.id === event.target.dataset.motifId)
        let motifChildren = settings.filter(m => m.parentId === motif.id)
        dispatch('displayCrudModal', {
            modalProps: {
                show: true,
                itemType: Config.userData.motifType,
                item: motif,
                itemChildren: motifChildren,
                formType: event.target.dataset.action,
                actionComplete: false
            }
        })
    }

    function toggleSortOrder(e) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    }

    function expandMotif(e) {
        console.log(`expandMotif() called`)
        console.dir(e)
        let motifId = e.target.dataset.itemId
        expandedMotifId = expandedMotifId === motifId ? '' : motifId
    }

    $: selectedSettings = updateSelectedMotifs(selectedSettingIds)
    $: console.log(`selectedSettingIds = [${selectedSettingIds.join(',')}]`)
    $: console.log(`viewType = ${viewType}`)
    $: console.log(`allMotifIds = [${settings.map(m => m.id).join(',')}]`)
    $: {
        console.log(`selectedSettings changed`)
        console.dir(selectedSettings)
    }
    $: dispatchListViewChange(viewType, sortType, sortOrder, expandedMotifId)
</script>

<style>
    h2 {
        cursor: pointer;
        padding: 10px;
    }
    .scrolldown > h2 {
        visibility: hidden;
    }
    section {
        margin-top: 0px;
        flex-direction: column;
    }

    section[data-closed='true'] {
        flex-direction: row;
        border: 1px solid var(--theme_color_6);
    }

    .list-controls {
        width: 100%;
        height: 50px;
        position: sticky;
        top: 109px;
        background-color: var(--theme_color_5);
        border: none;
        z-index: var(--front);
        padding-bottom: 10px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
    }
    .scrolldown .list-controls {
        top: 60px;
    }
    .select-all {
        display: flex;
        flex-direction: row;
        font-size: var(--theme_font_size_2);
        padding: 0;
        position: absolute;
        left: 10px;
    }
    .select-all input,
    .select-all label {
        display: block;
        padding: 0 5px;
    }
    .select-all input {
        width: 20px;
        max-width: 20px;
    }
    .list-view {
        flex-direction: row;
        padding: 0;
        position: absolute;
        left: 70px;
    }

    .list-view input,
    .list-view label {
        display: flex;
        flex: 1 1 0;
        padding: 0 5px;
    }
    .list-view input {
        width: 20px;
        max-width: 20px;
    }

    .list-sort {
        position: absolute;
        right: 10px;
    }
    .sort-order {
        -webkit-appearance: none;
        margin-left: 5px;
        padding: 0 11.5px;
        width: auto;
        font-size: var(--theme_font_size_3);
    }
    .settings-list {
        width: 100%;
    }
    .setting {
        /* padding: 10px 5px; */
        padding: 10px;
        display: grid;
        grid-template-columns: 10% 15% 15% 15% 15% 15% 15%;
        grid-template-rows: 40px 0px 0px 0px 0px;
        grid-row-gap: 2px;
        justify-items: stretch;
        width: 100%;
        margin: 5px 0;
        position: relative;
    }

    .setting div {
        padding: 0px;
    }

    .setting button {
        font-size: var(--theme_font_size_3);
    }

    .saved,
    .save {
        display: flex;
        flex-direction: column;
        justify-content: center;
        justify-self: center;
        padding: 2px;
        color: var(--theme_color_1);
        font-size: var(--theme_font_size_1);
        grid-column: 6 / span 1;
        grid-row: 1 / span 1;
        width: 90%;
        height: var(--touch_min_height);
    }

    .setting button.save {
        color: var(--theme_color_2);
        font-size: var(--theme_font_size_2);
    }
    .save:disabled {
        color: var(--theme_color_6);
    }

    .name-wrap {
        grid-column: 2 / span 4;
        grid-row: 1 / span 1;
        align-items: flex-start;
        margin-right: 5px;
    }

    .id {
        grid-column: 2 / span 4;
        grid-row: 3 / span 1;
        font-size: var(--theme_font_size_1);
    }

    .setting-settings {
        grid-column: 1 / span 4;
        grid-row: 2 / span 3;
    }

    .setting-display {
        grid-column: 1 / span 5;
        grid-row: 8 / span 1;
    }

    .setting-created {
        grid-column: 2 / span 3;
        grid-row: 1 / span 1;
        font-size: var(--theme_font_size_1);
        display: block;
        text-align: left;
        align-self: flex-end;
    }

    .download {
        grid-column: 5 / span 3;
        grid-row: 2 / span 1;
        width: 95%;
        justify-self: center;
    }

    .delete {
        grid-column: 7 / span 1;
        grid-row: 1 / span 1;
        margin: 0;
        justify-self: center;
        padding: 0 10px;
        background-color: var(--theme_color_10);
    }

    .selection {
        grid-column: 1 / span 2;
        grid-row: 1 / span 1;
        font-size: 10px;
        font-style: italic;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        padding-top: 5px;
    }

    .selection label {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .selection label span {
        padding-left: 5px;
    }

    .selection input {
        margin: 0;
        padding: 0px;
        width: 20px;
        min-height: unset;
        height: 20px;
    }

    .nested {
        grid-column: 2 / span 6;
        grid-row: 9 / span 5;
        align-items: flex-start;
    }

    .nested h2 {
        font-size: var(--theme_font_size_2);
    }

    select {
        width: auto;
        padding-top: 10px;
    }
    .expanded {
        grid-template-rows: 50px 50px auto auto auto;
        border: 1px solid var(--theme_color_1);
    }
</style>

<section
    {id}
    class="settings"
    class:nested={Boolean(parentId)}
    class:scrolldown={scrollDown}
    data-closed={!listOpen}
    in:fade>

    {#if listOpen && settings.length}
        <h2 on:click={toggleOpen}>{title} ({settings.length})</h2>
        {#if !parentId}
            {#if settings.length > 1}
                <div class="list-controls">
                    <div class="select-all">
                        <input
                            type="checkbox"
                            id="select-all"
                            on:click|self|stopPropagation={motifSelection} />
                        <label for="select-all">all</label>
                    </div>
                    <div class="list-sort">
                        <select bind:value={sortType}>
                            {#each Config.motifSorts as sort}
                                <option value={sort}>{sort}</option>
                            {/each}
                        </select>
                        <button class="sort-order" on:click={toggleSortOrder}>
                            {#if sortOrder === 'asc'}
                                <span class="asc">&#8679;</span>
                            {:else}
                                <span class="desc">&#8681;</span>
                            {/if}
                        </button>
                    </div>
                </div>
            {/if}
        {/if}
        <ul
            class="settings-list item-list"
            data-type="settings"
            data-view-type={viewType}>
            {#each settings.sort(motifSorter(sortType, sortOrder)) as { id: motifId, name, created, meta, parentId: motifParentId, notes, saved, transformations }}
                <li
                    class="setting"
                    class:expanded={expandedMotifId === motifId}
                    id="setting_{motifId}"
                    data-id={motifId}
                    data-saved={saved.local}>
                    <div class="selection">
                        <label class="select-theme">
                            <input
                                class="select"
                                type="checkbox"
                                on:click|self|stopPropagation={motifSelection}
                                value={motifId}
                                checked={selectedSettingIds.includes(motifId)} />
                        </label>

                    </div>
                    <div
                        class="name-wrap"
                        data-motif-id={motifId}
                        on:click|stopPropagation={expandMotif}>
                        <ItemName
                            itemType="settings"
                            item={settings.find(m => m.id === motifId)}
                            on:click
                            on:displayCrudModal />
                    </div>

                    {#if saved.local}
                        <span class="saved">saved</span>
                    {:else}
                        <button
                            class="save"
                            data-action="save"
                            data-motif-id={motifId}
                            on:click|self={dispatchDisplayModal}
                            disabled={settings.filter(m => m.saved.local).length >= Config.userData.savedItemLimit[Config.userData.motifType]}>
                            save
                        </button>
                    {/if}
                    <button
                        class="delete"
                        data-action="delete"
                        data-motif-id={motifId}
                        on:click|self={dispatchDisplayModal}>
                        &#9747;
                    </button>
                    <div class="motif-created">
                        {MotivicUtils.general.dateDisplay(new Date(created))}
                    </div>
                    {#if expandedMotifId === motifId}
                        <!-- TODO: assign uploaded settings tempo, length, timeSignature, etc so I can expect all these props to exist -->
                        <div class="motif-settings">
                            <MotifSettingsList
                                title="settings"
                                settings={meta} />
                        </div>

                        {#if !parentId}
                            <div class="download">
                                <DownloadControls
                                    loading={fileDownloading}
                                    selectedSettings={[settings.find(m => m.id === motifId)]}
                                    on:downloadFile />
                            </div>
                        {/if}
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</section>
