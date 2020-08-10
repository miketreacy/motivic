<script>
    import { onMount, createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    import Config from '../Config'
    import MotivicUtils from '../MotivicUtils'
    import AudioControls from './AudioControls.svelte'
    import CrudControls from './CrudControls.svelte'
    import DownloadControls from './DownloadControls.svelte'
    import ItemName from './ItemName.svelte'
    import MotifSettingsList from './MotifSettingsList.svelte'
    export let motifs = []
    export let selectedMotifs = []
    export let listOpen = false
    export let id = ''
    export let title = ''
    export let selectedMotifIds = []
    export let allSelected = false
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
        if (motifs.length) {
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
        let newIds = selectAll ? motifs.map(m => m.id) : [e.target.value]
        dispatch('motifSelection', {
            existingIds: selectedMotifIds,
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

    function toggleAllVariations(e) {
        let add = e.target.checked
        let themeId = e.target.dataset.motifId
        let childVariationIds = motifs
            .filter(m => m.parentId === themeId)
            .map(m => m.id)

        selectedMotifIds = updateSelectedMotifIds(childVariationIds, add)
    }

    function updateSelectedMotifIds(motifIds, add = true) {
        if (add) {
            return MotivicUtils.general.unique([
                ...selectedMotifIds,
                ...motifIds
            ])
        } else {
            return selectedMotifIds.filter(id => !motifIds.includes(id))
        }
    }

    function allVariationsAreSelected(themeId) {
        let childVariationIds = motifs
            .filter(m => m.parentId === themeId)
            .map(m => m.id)
        if (selectedMotifIds.length && childVariationIds.length) {
            return childVariationIds.every(id => selectedMotifIds.includes(id))
        } else {
            return false
        }
    }

    function getMotifVariations(motifId) {
        return motifs.filter(m => m.parentId === motifId)
    }

    function motifVariationCount(motifId) {
        return getMotifVariations(motifId).length
    }

    function updateSelectedMotifs(ids) {
        console.log(`updateSelectedMotifs()called with ids: ${ids.join(',')}`)
        return ids.map(id => motifs.find(m => m.id === id))
    }

    function displayMotif(motif) {
        let display = false
        if (viewType === 'flat') {
            // display all motifs in flat view
            display = true
        } else if (viewType === 'nested') {
            if (parentId) {
                // this is a nested variations list - only display children
                display = motif.parentId === parentId
            } else {
                // this is the root list - display any motifs without parents
                let parentExists = motif.parentId
                    ? motifs.some(m => m.id === motif.parentId)
                    : false
                display = !parentExists
            }
        }
        return display
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
        let motif = motifs.find(m => m.id === event.target.dataset.motifId)
        let motifChildren = motifs.filter(m => m.parentId === motif.id)
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

    $: selectedMotifs = updateSelectedMotifs(selectedMotifIds)
    $: console.log(`selectedMotifIds = [${selectedMotifIds.join(',')}]`)
    $: console.log(`viewType = ${viewType}`)
    $: console.log(`allMotifIds = [${motifs.map(m => m.id).join(',')}]`)
    $: {
        console.log(`selectedMotifs changed`)
        console.dir(selectedMotifs)
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
    .motif-controls {
        background-color: var(--theme_color_5);
        flex: none;
        flex-direction: row;
        flex-wrap: wrap;
        padding: 0;
        border: none;
        border-bottom: none;
        position: sticky;
        position: -webkit-sticky;
        top: 59px;
        z-index: var(--front);
        justify-content: space-between;
        padding: 10px;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }
    .scrolldown .motif-controls {
        top: 0px;
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
    .motif-list {
        width: 100%;
    }
    .motif {
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

    .motif div {
        padding: 0px;
    }

    .motif button {
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

    .motif button.save {
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

    .motif-settings {
        grid-column: 1 / span 4;
        grid-row: 2 / span 3;
    }

    .motif-display {
        grid-column: 3 / span 1;
        grid-row: 2 / span 1;
    }

    .motif-display button {
        font-size: var(--theme_font_size_2);
    }

    .motif-created {
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

    .variations .motif .transformations {
        font-size: var(--theme_font_size_1);
    }

    .delete {
        grid-column: 7 / span 1;
        grid-row: 1 / span 1;
        margin: 0;
        justify-self: center;
        padding: 0 10px;
        background-color: var(--theme_color_10);
    }

    .transformations-header {
        display: flex;
        grid-column: 2 / span 3;
        grid-row: 5 / span 1;
        align-items: flex-start;
    }

    .transformations {
        /* display: flex;
    grid-column: 3 / span 4;
    grid-row: 6 / span 3;
    align-items: flex-start; */

        grid-column: 1 / span 5;
        grid-row: 5 / span 3;
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

    label.select-all-variations {
        margin-top: 5px;
    }

    .motif.has-variations > .selection label {
        align-items: center;
    }

    .motif.has-variations > .selection label.select-theme span {
        display: inline;
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
    class="motifs"
    class:nested={Boolean(parentId)}
    class:scrolldown={scrollDown}
    data-closed={!listOpen}
    in:fade>

    {#if listOpen && motifs.length}
        <h2 on:click={toggleOpen}>{title} ({motifs.length})</h2>
        {#if !parentId}
            <section class="motif-controls">
                <AudioControls {selectedMotifs} on:displayAlert />
            </section>
            {#if motifs.length > 1}
                <div class="list-controls">
                    <div class="select-all">
                        <input
                            type="checkbox"
                            id="select-all"
                            on:click|self|stopPropagation={motifSelection} />
                        <label for="select-all">all</label>
                    </div>
                    {#if motifs.some(m => m.parentId)}
                        <!-- only display if there are variations to nest -->
                        <div class="list-view">
                            <!-- <span>list view:</span> -->
                            <input
                                type="radio"
                                name="list-view"
                                id="list-view-flat"
                                value="flat"
                                checked={viewType == 'flat'}
                                bind:group={viewType} />
                            <label for="list-view-flat">flat</label>
                            <input
                                type="radio"
                                name="list-view"
                                id="list-view-nested"
                                value="nested"
                                checked={viewType == 'nested'}
                                bind:group={viewType} />
                            <label for="list-view-nested">nested</label>
                        </div>
                    {/if}
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
            class="motif-list item-list"
            data-type="motifs"
            data-view-type={viewType}>
            {#each motifs
                .filter(displayMotif)
                .sort(
                    motifSorter(sortType, sortOrder)
                ) as { id: motifId, name, created, meta, parentId: motifParentId, notes, saved, transformations }}
                <li
                    class="motif"
                    class:expanded={expandedMotifId === motifId}
                    id="motif_{motifId}"
                    data-id={motifId}
                    data-saved={saved.local}>
                    <div class="selection">
                        <label class="select-theme">
                            <input
                                class="select"
                                type="checkbox"
                                on:click|self|stopPropagation={motifSelection}
                                value={motifId}
                                checked={selectedMotifIds.includes(motifId)} />
                        </label>
                        <!-- TODO: commenting this out for now because things have gotten too crowded -->
                        <!-- TODO: maybe move motif crud operation back to the batch edit multi-selector? -->
                        <!-- {#if viewType === 'nested' && motifVariationCount(motifId) > 1}
                            <label class="select-all-variations">
                                <input
                                    class="select-all-variations"
                                    type="checkbox"
                                    data-motif-id={motifId}
                                    on:click|self|stopPropagation={toggleAllVariations}
                                    checked={allVariationsAreSelected(motifId)} />
                                <span>all variations</span>
                            </label>
                        {/if} -->
                    </div>
                    <div
                        class="name-wrap"
                        data-motif-id={motifId}
                        on:click|stopPropagation={expandMotif}>
                        <ItemName
                            itemType="motifs"
                            item={motifs.find(m => m.id === motifId)}
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
                            disabled={motifs.filter(m => m.saved.local).length >= Config.userData.savedItemLimit[Config.userData.motifType]}>
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
                        <!-- TODO: assign uploaded motifs tempo, length, timeSignature, etc so I can expect all these props to exist -->
                        <div class="motif-settings">
                            <MotifSettingsList
                                title="settings"
                                settings={meta} />
                        </div>

                        <div class="motif-display">
                            <button on:click={e => openMotifView(motifId)}>
                                open
                            </button>
                        </div>

                        {#if !parentId}
                            <div class="download">
                                <DownloadControls
                                    loading={fileDownloading}
                                    selectedMotifs={[motifs.find(m => m.id === motifId)]}
                                    on:downloadFile />
                            </div>
                        {/if}
                        {#if transformations && transformations.length}
                            <div class="transformations">
                                <MotifSettingsList
                                    title="transformations"
                                    settings={transformations.reduce(
                                        (map, { type, params }) => {
                                            map[type] = params.join(', ')
                                            return map
                                        },
                                        {}
                                    )} />
                            </div>
                        {/if}
                        {#if viewType === 'nested' && motifVariationCount(motifId)}
                            <svelte:self
                                id={`${motifId}_variations`}
                                title="variations"
                                {listOpen}
                                {viewType}
                                {sortType}
                                {sortOrder}
                                motifs={getMotifVariations(motifId)}
                                parentId={motifId}
                                {expandedMotifId}
                                {selectedMotifIds}
                                {allSelected}
                                on:displayToggle
                                on:displayCrudModal
                                on:motifSelection />
                        {/if}
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</section>
