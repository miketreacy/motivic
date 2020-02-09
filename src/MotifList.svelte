<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import Config from "./Config.js";
  import Utils from "./Utils.js";
  import AudioControls from "./AudioControls.svelte";
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
  export let viewType;
  export let parentId = "";
  export let sortType;
  export let sortOrder;
  let renameFormOpenId = "";
  let renameFormValue = "";
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

  // function toggleviewType(e) {
  //   viewType = viewType === "nested" ? "flat" : "nested";
  // }

  function dispatchListViewChange(viewType, sortType, sortOrder) {
    dispatch("listViewChange", {
      viewType,
      sortType,
      sortOrder
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

  function toggleRenameForm(e) {
    let renamedMotifId = e.target.dataset.motifId;
    if (renameFormOpenId === renamedMotifId) {
      renameFormOpenId = "";
      renameFormValue = "";
    } else {
      renameFormOpenId = renamedMotifId;
    }
  }

  function renameMotif(e) {
    let renameMotifId = e.target.dataset.motifId;
    let renameMotif = motifs.find(m => m.id === renameMotifId);
    renameMotif.name = renameFormValue;
    renameFormValue = "";
    let [success, msg] = Utils.userData.persist(renameMotif, "motifs", true);
    toggleRenameForm(e);
  }

  $: selectedMotifs = updateSelectedMotifs(selectedMotifIds);
  $: console.log(`selectedMotifIds = [${selectedMotifIds.join(",")}]`);
  $: console.log(`viewType = ${viewType}`);
  $: console.log(`allMotifIds = [${motifs.map(m => m.id).join(",")}]`);
  $: {
    console.log(`selectedMotifs changed`);
    console.dir(selectedMotifs);
  }
  $: dispatchListViewChange(viewType, sortType, sortOrder);
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
    position: absolute;
    top: 0px;
    width: 100%;
    flex-direction: column;
  }

  .motif .rename button {
    max-width: 40px;
    font-size: var(--theme_font_size_1);
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
    width: 40px;
    justify-self: end;
    padding: 0 10px;
  }

  .motif .name {
    text-align: left;
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
    <ol class="motif-list item-list" data-type="motifs">
      {#each motifs
        .filter(displayMotif)
        .sort(
          motifSorter(sortType, sortOrder)
        ) as { id: motifId, name, created, parent: motifParentId, tempo, notes, saved, transformations }}
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
            {#if viewType === 'nested' && motifVariationCount(motifId) > 1}
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
          <h3
            class="name"
            data-motif-id={motifId}
            on:click|self|stopPropagation={toggleRenameForm}>
            {name}
          </h3>
          <fieldset class="rename" class:hide={renameFormOpenId !== motifId}>
            <input
              type="text"
              bind:value={renameFormValue}
              placeholder={name} />
            <button
              class="rename-cancel"
              data-motif-id={motifId}
              on:click|self|stopPropagation={toggleRenameForm}>
              cancel
            </button>
            <button
              class="rename-submit"
              data-motif-id={motifId}
              on:click|self|stopPropagation={renameMotif}>
              save
            </button>
          </fieldset>
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
          <button
            class="delete"
            data-action="delete"
            data-motif-id={motifId}
            on:click|self={dispatchDisplayModal}>
            &#9747;
          </button>
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
            <ol class="transformations">
              {#each transformations as { type, params }, i}
                <li class="transformation">{type}: {params.join(', ')}</li>
              {/each}
            </ol>
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
