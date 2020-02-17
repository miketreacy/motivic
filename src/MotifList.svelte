<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import Config from "./Config.js";
  import Utils from "./Utils.js";
  import AudioControls from "./AudioControls.svelte";
  import CrudControls from "./CrudControls.svelte";
  import DownloadControls from "./DownloadControls.svelte";
  import MotifControls from "./MotifControls.svelte";
  import ItemName from "./ItemName.svelte";
  export let motifs = [];
  export let selectedMotifs = [];
  export let listOpen = false;
  export let id = "";
  export let title = "";
  export let selectedMotifIds = [];
  export let allSelected = false;
  export let viewType;
  export let parentId = "";
  export let sortType;
  export let sortOrder;
  export let expandedMotifId;
  const generationLevels = Config.motifGenerationDisplayCount;
  const dispatch = createEventDispatcher();

  function toggleOpen(e) {
    console.log(`MotifList.toggleOpen() called listOpen=${listOpen}`);
    if (motifs.length) {
      listOpen = !listOpen;
      dispatch("displayToggle", { section: id, open: listOpen });
    }
  }

  function motifSelection(e) {
    let selectAll = e.target.id === "select-all";
    let add = e.target.checked;
    let newIds = selectAll ? motifs.map(m => m.id) : [e.target.value];
    dispatch("motifSelection", { existingIds: selectedMotifIds, newIds, add });
  }

  function dispatchListViewChange(
    viewType,
    sortType,
    sortOrder,
    expandedMotifId
  ) {
    dispatch("listViewChange", {
      viewType,
      sortType,
      sortOrder,
      expandedMotifId
    });
  }

  function toggleAllVariations(e) {
    let add = e.target.checked;
    let themeId = e.target.dataset.motifId;
    let childVariationIds = motifs
      .filter(m => m.parent === themeId)
      .map(m => m.id);

    selectedMotifIds = updateSelectedMotifIds(childVariationIds, add);
  }

  function updateSelectedMotifIds(motifIds, add = true) {
    if (add) {
      return [...new Set([...selectedMotifIds, ...motifIds])];
    } else {
      return selectedMotifIds.filter(id => !motifIds.includes(id));
    }
  }

  function allVariationsAreSelected(themeId) {
    let childVariationIds = motifs
      .filter(m => m.parent === themeId)
      .map(m => m.id);
    if (selectedMotifIds.length && childVariationIds.length) {
      return childVariationIds.every(id => selectedMotifIds.includes(id));
    } else {
      return false;
    }
  }

  function getMotifVariations(motifId) {
    return motifs.filter(m => m.parent === motifId);
  }

  function motifVariationCount(motifId) {
    return getMotifVariations(motifId).length;
  }

  function updateSelectedMotifs(ids) {
    console.log(`updateSelectedMotifs()called with ids: ${ids.join(",")}`);
    return ids.map(id => motifs.find(m => m.id === id));
  }

  function displayMotif(motif) {
    let display = false;
    if (viewType === "flat") {
      // display all motifs in flat view
      display = true;
    } else if (viewType === "nested") {
      if (parentId) {
        // this is a nested variations list - only display children
        display = motif.parent === parentId;
      } else {
        // this is the root list - display any motifs without parents
        let parentExists = motif.parent
          ? motifs.some(m => m.id === motif.parent)
          : false;
        display = !parentExists;
      }
    }
    return display;
  }

  function motifSorter(key, order) {
    console.info(`motifSorter(${key}, ${order})`);
    if (key === "created") {
      return Utils.general.objectKeySorterNum(key, order, ts =>
        new Date(ts).getTime()
      );
    } else {
      // assume key value is string
      return Utils.general.objectKeySorterAlpha(key, order);
    }
  }

  onMount(() => {
    console.info(`onMount() props: ${id}`);
    console.dir($$props);
  });

  function dispatchDisplayModal(event) {
    dispatch("displayCrudModal", {
      modalProps: {
        show: true,
        itemType: "motifs",
        item: motifs.find(m => m.id === event.target.dataset.motifId),
        formType: event.target.dataset.action,
        actionComplete: false
      }
    });
  }

  function toggleSortOrder(e) {
    sortOrder = sortOrder === "asc" ? "desc" : "asc";
  }

  function expandMotif(e) {
    console.log(`expandMotif() called`);
    console.dir(e);
    let motifId = e.target.dataset.itemId;
    expandedMotifId = expandedMotifId === motifId ? "" : motifId;
  }

  $: selectedMotifs = updateSelectedMotifs(selectedMotifIds);
  $: console.log(`selectedMotifIds = [${selectedMotifIds.join(",")}]`);
  $: console.log(`viewType = ${viewType}`);
  $: console.log(`allMotifIds = [${motifs.map(m => m.id).join(",")}]`);
  $: {
    console.log(`selectedMotifs changed`);
    console.dir(selectedMotifs);
  }
  $: dispatchListViewChange(viewType, sortType, sortOrder, expandedMotifId);
</script>

<style>
  h2 {
    cursor: pointer;
    padding: 10px;
  }
  section {
    margin-top: 0px;
    flex-direction: column;
  }
  section[data-closed="true"] {
    flex-direction: row;
    border: 1px solid var(--theme_color_6);
  }
  .motif-controls {
    background-color: var(--theme_color_2);
    flex: none;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0;
    border: 2px solid var(--theme_color_6);
    position: sticky;
    /* TODO: write a css variable for this offset */
    top: 59px;
    background-color: var(--theme_color_2);
    z-index: var(--front);
  }

  .list-controls {
    width: 100%;
    height: 40px;
    position: sticky;
    /* TODO: write a css variable for this offset */
    top: 112px;
    background-color: var(--theme_color_2);
    border: 2px solid var(--theme_color_6);
    border-top: none;
    z-index: var(--front);
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
  }
  .motif-list {
    width: 100%;
  }
  .motif {
    border: 1px solid var(--theme_color_7);
    padding: 10px 5px 10px 10px;
    display: grid;
    grid-template-columns: 10% 15% 15% 15% 15% 15% 15%;
    grid-template-rows: 30px 0px 0px 0px 0px;
    grid-row-gap: 2px;
    justify-items: stretch;
    width: 100%;
    margin: 5px 0;
    position: relative;
  }

  .motif div {
    padding: 0px;
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
  }

  .save {
    color: var(--theme_color_2);
  }
  .save:disabled {
    color: var(--theme_color_6);
  }

  .name-wrap {
    grid-column: 2 / span 4;
    grid-row: 1 / span 1;
  }

  .id {
    grid-column: 2 / span 4;
    grid-row: 3 / span 1;
    font-size: var(--theme_font_size_1);
  }

  .motif-display {
    grid-column: 1 / span 5;
    grid-row: 3 / span 1;
  }

  .motif-created {
    grid-column: 2 / span 3;
    grid-row: 2 / span 1;
    font-size: var(--theme_font_size_1);
    display: block;
    text-align: left;
  }

  .download {
    grid-column: 6 / span 2;
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
    width: 40px;
    width: 90%;
    justify-self: center;
    padding: 0 10px;
    background-color: var(--theme_color_10);
  }

  .transformations-header {
    display: flex;
    grid-column: 2 / span 3;
    grid-row: 4 / span 1;
    align-items: flex-start;
  }

  .transformations {
    display: flex;
    grid-column: 3 / span 4;
    grid-row: 5 / span 1;
    align-items: flex-start;
  }

  .selection {
    grid-column: 1 / span 1;
    grid-row: 1 / span 1;
    font-size: 10px;
    font-style: italic;
    flex-direction: column;
    align-items: flex-start;
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

  label.select-theme {
    height: 30px;
  }

  .motif.has-variations > .selection label.select-theme span {
    display: inline;
  }

  .nested {
    grid-column: 2 / span 6;
    grid-row: 4 / span 5;
    align-items: flex-start;
  }

  .nested h2 {
    font-size: var(--theme_font_size_2);
  }

  select {
    width: auto;
  }
  .expanded {
    grid-template-rows: 30px 30px 30px 30px 30px;
    border: 1px solid var(--theme_color_1);
  }
</style>

<section
  {id}
  class="motifs"
  class:nested={Boolean(parentId)}
  data-closed={!listOpen}>
  <h2 on:click={toggleOpen}>{title} ({motifs.length})</h2>
  {#if listOpen && motifs.length}
    {#if !parentId}
      <section class="motif-controls">
        <AudioControls {selectedMotifs} />
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
          {#if motifs.some(m => m.parent)}
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
        ) as { id: motifId, name, created, parent: motifParentId, tempo, notes, saved, transformations }}
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
            {#if viewType === 'nested' && motifVariationCount(motifId) > 1}
              <label class="select-all-variations">
                <input
                  class="select-all-variations"
                  type="checkbox"
                  data-motif-id={motifId}
                  on:click|self|stopPropagation={toggleAllVariations}
                  checked={allVariationsAreSelected(motifId)} />
                <span>all variations</span>
              </label>
            {/if}
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
              disabled={motifs.filter(m => m.saved.local).length >= Config.userData.savedItemLimit['motifs']}>
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
          {#if expandedMotifId === motifId}
            <div class="motif-created">
              {Utils.general.dateDisplay(new Date(created))}
            </div>
            <div class="motif-display">display motif here</div>
            <div class="download">
              <DownloadControls
                selectedMotifs={[motifs.find(m => m.id === motifId)]} />
            </div>
            {#if transformations && transformations.length}
              <h4 class="transformations-header">transformations:</h4>
              <!-- TODO: refine this recursion -->
              <ul class="transformations">
                {#each transformations as { type, params }, i}
                  <li class="transformation">{type}: {params.join(', ')}</li>
                {/each}
              </ul>
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
