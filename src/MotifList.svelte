<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import Config from "./Config.js";
  import CrudControls from "./CrudControls.svelte";
  import DownloadControls from "./DownloadControls.svelte";
  import MotifControls from "./MotifControls.svelte";
  export let motifs = [];
  export let selectedMotifs = [];
  export let listOpen = false;
  export let id = "";
  export let title = "";
  export let selectedMotifIds = [];
  export let allSelected = false;
  export let listView = "nested";
  export let parentId = "";
  let downloadMenuDisplayMotifId = "";
  let displayMotifs = [];
  let selectedSortType = "created";
  let selectedSortOrder = "asc";
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

  function toggleListView(e) {
    listView = listView === "nested" ? "flat" : "nested";
  }

  function motifIsRootNode(motifParentId) {
    let parent = motifs.find(m => m.id === motifParentId);
    return Boolean(!parent);
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

  function motifHasVariations(motifId) {
    let childVariations = motifs.filter(m => m.parent === motifId);
    return Boolean(childVariations.length);
  }

  function motifVariationCount(motifId) {
    let childVariations = motifs.filter(m => m.parent === motifId);
    return childVariations.length;
  }

  function updateSelectedMotifs(ids) {
    console.log(`updateSelectedMotifs()called with ids: ${ids.join(",")}`);
    return ids.map(id => motifs.find(m => m.id === id));
  }

  function displayMotif(motif) {
    console.log(`displayMotif: listView = ${listView}`);
    if (listView === "flat") {
      // display all motifs in flat view
      return true;
    }

    if (listView === "nested") {
      if (parentId) {
        // this is a nested variations list - only display children
        return motif.parent === parentId;
      } else {
        // this is the root list - display any motifs without parents
        let parent = motifs.find(m => m.id === motif.parent);
        return Boolean(!parent);
      }
    }
  }

  function motifSorter(key, order) {
    return order === "asc"
      ? (a, b) => a[key] - b[key]
      : (a, b) => b[key] - a[key];
  }

  function getDisplayMotifs(listView, sortType, sortOrder) {
    return motifs.filter(displayMotif).sort(motifSorter(sortType, sortOrder));
  }

  onMount(() => {
    console.info(`onMount() props: ${id}`);
    console.dir($$props);
  });

  function toggleDownloadMenu(e) {
    let thisMotifId = e.target.dataset.motifId;
    downloadMenuDisplayMotifId =
      downloadMenuDisplayMotifId === thisMotifId ? "" : thisMotifId;
  }

  function timeoutDownloadDisplay(motifId) {
    console.log(`timeoutDownloadDisplay() called with ${motifId}`);
    if (motifId) {
      setTimeout(() => {
        downloadMenuDisplayMotifId = "";
      }, 3000);
    }
  }

  function dispatchDisplayModal(event) {
    dispatch("displayCrudModal", {
      modalProps: {
        show: true,
        itemType: "motifs",
        item: displayMotifs.find(m => m.id === event.target.dataset.motifId),
        formType: event.target.dataset.action,
        actionComplete: false
      }
    });
  }

  $: selectedMotifs = updateSelectedMotifs(selectedMotifIds);
  $: console.log(`selectedMotifIds = [${selectedMotifIds.join(",")}]`);
  $: console.log(`listView = ${listView}`);
  $: console.log(`allMotifIds = [${motifs.map(m => m.id).join(",")}]`);
  $: {
    console.log(`selectedMotifs changed`);
    console.dir(selectedMotifs);
  }
  $: displayMotifs = getDisplayMotifs(
    listView,
    selectedSortType,
    selectedSortOrder
  );
  $: timeoutDownloadDisplay(downloadMenuDisplayMotifId);
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
  .list-row {
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
    top: 6px;
  }
  .select-all input,
  .select-all label {
    display: block;
    padding: 0 10px;
  }
  .select-all input {
    width: 20px;
    max-width: 20px;
  }
  .list-view {
    flex-direction: row;
    padding: 0;
    position: absolute;
    right: 4px;
    top: 6px;
  }
  .list-view span {
    padding: 0 5px;
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
  .motif-list {
    width: 100%;
  }
  .motif {
    border: 1px solid var(--theme_color_7);
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(2, auto);
    grid-column-gap: 2px;
    grid-row-gap: 2px;
    justify-items: stretch;
    width: 100%;
    margin: 5px 0;
    position: relative;
  }

  .motif div {
    padding: 0px;
  }

  .motif .saved,
  .motif .save {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 2px;
    color: var(--theme_color_1);
    font-size: var(--theme_font_size_1);
    grid-column: 5 / span 1;
    grid-row: 1 / span 1;
    width: 90%;
    justify-self: end;
  }

  .motif .save {
    color: var(--theme_color_2);
  }

  .motif .name {
    padding-top: 5px;
    grid-column: 2 / span 3;
    grid-row: 1 / span 1;
    cursor: text;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .motif .id {
    grid-column: 2 / span 4;
    grid-row: 3 / span 1;
    font-size: var(--theme_font_size_1);
  }

  .motif .motif-display {
    grid-column: 1 / span 5;
    grid-row: 3 / span 1;
  }

  .motif .motif-created {
    grid-column: 2 / span 3;
    grid-row: 2 / span 1;
    font-size: var(--theme_font_size_1);
    display: block;
    text-align: left;
  }

  .download {
    grid-column: 5 / span 2;
    grid-row: 2 / span 1;
  }

  .motif .rename {
    padding-top: 5px;
    grid-column: 2 / span 2;
    grid-row: 1 / span 1;
  }

  .motif .name,
  .motif .rename input {
    font-size: var(--theme_font_size_2);
  }

  .variations .motif .name,
  .variations .motif .transformations,
  .variations .motif .rename input {
    font-size: var(--theme_font_size_1);
  }

  .motif .delete {
    grid-column: 6 / span 1;
    grid-row: 1 / span 1;
    margin: 0;
    width: 90%;
    justify-self: end;
    padding: 0 10px;
  }

  .motif .name {
    text-align: left;
  }

  .transformations-header {
    display: flex;
    grid-column: 3 / span 2;
    grid-row: 4 / span 1;
    align-items: flex-start;
  }

  .transformations {
    display: flex;
    grid-column: 2 / span 4;
    grid-row: 4 / span 1;
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
    align-items: flex-end;
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
    grid-column: 2 / span 5;
    grid-row: 4 / span 5;
    align-items: flex-start;
  }

  .nested h2 {
    font-size: var(--theme_font_size_2);
  }

  select {
    width: auto;
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
      <MotifControls {selectedMotifs} on:displayCrudModal />
      <div class="list-row">
        <div class="select-all">
          <input
            type="checkbox"
            id="select-all"
            on:click|self|stopPropagation={motifSelection} />
          <label for="select-all">all</label>
        </div>
        <div class="list-view">
          <!-- <span>list view:</span> -->
          <input
            type="radio"
            name="list-view"
            id="list-view-nested"
            value="nested"
            checked={listView == 'nested'}
            bind:group={listView}
            on:click={toggleListView} />
          <label for="list-view-nested">nested</label>
          <input
            type="radio"
            name="list-view"
            id="list-view-flat"
            value="flat"
            checked={listView == 'flat'}
            bind:group={listView}
            on:click={toggleListView} />
          <label for="list-view-flat">flat</label>
          <select bind:value={selectedSortType}>
            {#each Config.motifSorts as sort}
              <option value={sort}>{sort}</option>
            {/each}
          </select>
          <select bind:value={selectedSortOrder}>
            <option value="asc">&#8679;</option>
            <option value="desc">&#8681;</option>
          </select>
        </div>
      </div>
    {/if}
    <ol class="motif-list item-list" data-type="motifs">
      {#each displayMotifs as { id: motifId, name, created, parent: motifParentId, tempo, notes, saved, transformations }}
        <li
          class="motif"
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
            {#if listView === 'nested' && motifVariationCount(motifId) > 1}
              <label class="select-all-variations">
                <input
                  class="select-all-variations"
                  type="checkbox"
                  data-motif-id={motifId}
                  on:click={toggleAllVariations}
                  checked={allVariationsAreSelected(motifId)} />
                <span>all variations</span>
              </label>
            {/if}
          </div>
          <h3 class="name">{name}</h3>
          {#if saved.local}
            <span class="saved">saved</span>
          {:else}
            <button
              class="save"
              data-action="save"
              data-motif-id={motifId}
              on:click|self={dispatchDisplayModal}>
              save
            </button>
          {/if}
          <div class="rename hide">
            <input type="text" value="" />
            <button class="rename-cancel">cancel</button>
            <button class="rename-submit">save</button>
          </div>
          <button
            class="delete"
            data-action="delete"
            data-motif-id={motifId}
            on:click|self={dispatchDisplayModal}>
            &#9747;
          </button>
          <div class="motif-created">{created}</div>
          <div class="motif-display">display motif here</div>
          <div class="download">
            <DownloadControls
              selectedMotifs={[displayMotifs.find(m => m.id === motifId)]} />
          </div>
          {#if transformations && transformations.length}
            <h4 class="transformations-header">transformations:</h4>
            <!-- TODO: refine this recursion -->
            <ol class="transformations">
              {#each transformations as { type, params }, i}
                <li class="transformation">{type}: {params.join(', ')}</li>
              {/each}
            </ol>
          {/if}
          {#if listView === 'nested' && motifVariationCount(motifId)}
            <svelte:self
              id={`${motifId}_variations`}
              title="variations"
              {listOpen}
              {listView}
              {motifs}
              parentId={motifId}
              {selectedMotifIds}
              {allSelected}
              on:displayToggle
              on:displayCrudModal
              on:motifSelection />
          {/if}
        </li>
      {/each}
    </ol>
  {/if}
</section>
