<script>
  import { createEventDispatcher } from "svelte";
  import MotifControls from "./MotifControls.svelte";
  import MotifListItem from "./MotifListItem.svelte";
  export let motifs = [];
  export let selectedMotifs = [];
  export let listOpen = false;
  export let id = "motifs";
  let selectedMotifIds = [];
  const dispatch = createEventDispatcher();
  function dispatchListToggle(listId, listOpen) {
    dispatch("displayToggle", { section: listId, open: listOpen });
  }
  function toggleOpen(e) {
    listOpen = !listOpen;
    dispatchListToggle(id, listOpen);
  }

  function updateSelectedMotifs(motifIds) {
    return motifs.filter(m => motifIds.includes(m.id));
  }

  function handleMotifSelection(event) {
    selectedMotifIds = event.detail.selected
      ? [...new Set([...selectedMotifIds, ...event.detail.ids])]
      : selectedMotifIds.filter(motifId => !event.detail.ids.includes(motifId));
  }

  $: {
    selectedMotifs = updateSelectedMotifs(selectedMotifIds);
  }
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
  .motif-list {
    width: 100%;
  }
</style>

<section {id} class="sidebar motifs" data-closed={!listOpen}>
  <h2 on:click={toggleOpen}>My Motifs ({motifs.length})</h2>
  {#if listOpen}
    <MotifControls {selectedMotifs} />
    <div class="list-row">
      <div class="select-all">
        <input
          type="checkbox"
          id="select-all"
          data-action="multi"
          value="off" />
        <label for="select-all">select all</label>
      </div>
    </div>
    <!--Disabling pagination feature for Launch MVP-->
    <!--<div id="pagination">-->
    <!--<div id="page-display"></div>-->
    <!--<button id="page-first" data-page="1"><<</button>-->
    <!--<button id="page-back" data-page><</button>-->
    <!--<button id="page-forward" data-page>></button>-->
    <!--<button id="page-last" data-page>>></button>-->
    <!--</div>-->
    <ol class="motif-list item-list" data-type="motifs">
      {#each motifs as { id, name, role, parent, tempo, notes, saved, variations, transformations }}
        <MotifListItem
          {id}
          {name}
          {role}
          {parent}
          {tempo}
          {notes}
          {saved}
          {variations}
          {transformations}
          on:motifSelection={handleMotifSelection} />
      {/each}
    </ol>
  {/if}

</section>
