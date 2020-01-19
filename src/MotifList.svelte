<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import MotifControls from "./MotifControls.svelte";
  export let motifs = [];
  export let selectedMotifs = [];
  export let listOpen = false;
  export let id = "";
  export let title = "";
  export let selectedMotifIds = [];
  export let allSelected = false;
  export let listView = "nested";
  export let isRootList = false;
  let root = "";
  const dispatch = createEventDispatcher();

  function toggleOpen(e) {
    console.log(`MotifList.toggleOpen() called listOpen=${listOpen}`);
    if (motifs.length) {
      listOpen = !listOpen;
      dispatch("displayToggle", { section: id, open: listOpen });
    }
  }

  function toggleListView(e) {
    listView = listView === "nested" ? "flat" : "nested";
  }

  function handleSelectAll(all) {
    return all ? motifs.map(m => m.id) : [];
  }

  function motifIsRootNode(motifParentId) {
    let parent = motifs.find(m => m.id === motifParentId);
    return Boolean(!parent);
  }

  onMount(() => {
    console.info(`onMount() props: ${id}`);
    console.dir($$props);
  });

  $: selectedMotifIds = handleSelectAll(allSelected);
  $: selectedMotifs = selectedMotifIds.map(id => motifs.find(m => m.id === id));
  $: console.log(`selectedMotifIds = [${selectedMotifIds.join(",")}]`);
  $: console.log(`listView = ${listView}`);
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
    position: relative;
    width: 100%;
    height: 40px;
  }
  .select-all {
    display: flex;
    flex-direction: row;
    font-size: var(--theme_font_size_2);
    padding: 0;
    position: absolute;
    left: 0px;
    top: 7px;
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
    right: 0px;
    top: 7px;
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
  .selected-motif-ids {
    position: absolute;
    right: 0;
    display: flex;
    flex-direction: column;
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
  }

  .motif div {
    padding: 0px;
  }

  .motif .saved {
    display: flex;
    align-items: center;
    padding: 2px;
    color: var(--theme_color_1);
    font-size: var(--theme_font_size_1);
    grid-column: 5 / span 1;
    grid-row: 1 / span 1;
  }

  .motif .name {
    padding-top: 5px;
    grid-column: 2 / span 4;
    grid-row: 1 / span 1;
    cursor: text;
  }

  .motif .id {
    grid-column: 2 / span 4;
    grid-row: 2 / span 1;
    font-size: var(--theme_font_size_1);
  }

  .motif .motif-display {
    grid-column: 1 / span 6;
    grid-row: 2 / span 1;
  }

  .motif .rename {
    padding-top: 5px;
    grid-column: 3 / span 2;
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

  .motif .remove {
    grid-column: 6 / span 1;
    grid-row: 1 / span 1;
    margin: 0;
    width: auto;
    justify-self: end;
    padding: 0 10px;
  }

  .motif .name {
    text-align: left;
  }

  .transformations-header {
    display: flex;
    grid-column: 3 / span 2;
    grid-row: 3 / span 1;
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

  .motif.has-variations > .selection {
    display: grid;
  }

  .motif.has-variations > .selection label {
    align-items: center;
  }

  .motif.has-variations > .selection label.select-theme span {
    display: inline;
  }

  .nested {
    grid-column: 2 / span 5;
    grid-row: 3 / span 5;
    align-items: flex-start;
  }

  .nested h2 {
    font-size: var(--theme_font_size_2);
  }
</style>

<section {id} class="motifs" class:nested={!isRootList} data-closed={!listOpen}>
  <h2 on:click={toggleOpen}>{title} ({motifs.length})</h2>
  {#if listOpen && motifs.length}
    {#if isRootList}
      <MotifControls {selectedMotifs} on:displayCrudModal />
      <div class="list-row">
        <div class="select-all">
          <input type="checkbox" id="select-all" bind:checked={allSelected} />
          <label for="select-all">select all</label>
        </div>
        <div class="list-view">
          <span>list view:</span>
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
        </div>
      </div>
    {/if}
    <ol class="motif-list item-list" data-type="motifs">
      {#each motifs as { id: motifId, name, role, parent, tempo, notes, saved, variations, transformations }}
        {#if listView === 'flat' || (listView === 'nested' && motifIsRootNode(parent)) || !isRootList}
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
                  bind:group={selectedMotifIds}
                  value={motifId} />
                {#if listView === 'nested' && variations && variations.length}
                  <span>theme</span>
                {/if}
              </label>
              {#if listView === 'nested' && variations && variations.length}
                <label class="select-all-variations">
                  <input
                    class="select-all-variations"
                    type="checkbox"
                    data-action="multi"
                    bind:group={selectedMotifIds}
                    value="off" />
                  <span>all</span>
                </label>
              {/if}
            </div>
            <h3 class="name">{name}</h3>
            {#if saved.local}
              <span class="saved">(saved)</span>
            {/if}
            <div class="rename hide">
              <input type="text" value="" />
              <button class="rename-cancel">cancel</button>
              <button class="rename-submit">save</button>
            </div>
            <button class="remove">&#9747;</button>
            <div class="motif-display">display motif here</div>
            {#if transformations && transformations.length}
              <h4 class="transformations-header">transformations:</h4>
              <!-- TODO: refine this recursion -->
              <ol class="transformations">
                {#each transformations as { type, params }, i}
                  <li class="transformation">{type}: {params.join(', ')}</li>
                {/each}
              </ol>
            {/if}
            {#if listView === 'nested' && variations && variations.length}
              <svelte:self
                id={`${motifId}_variations`}
                title="variations"
                {listOpen}
                {listView}
                motifs={variations}
                {selectedMotifIds}
                {allSelected}
                isRootList={false}
                on:displayToggle
                on:displayCrudModal />
            {/if}
          </li>
        {/if}
      {/each}
    </ol>
  {/if}
</section>
