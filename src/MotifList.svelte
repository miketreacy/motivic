<script>
  import { createEventDispatcher } from "svelte";
  import MotifControls from "./MotifControls.svelte";
  import MotifListItem from "./MotifListItem.svelte";
  export let motifs = [];
  export let listOpen = false;
  export let id = "motifs";
  const dispatch = createEventDispatcher();
  function dispatchListToggle(listId, listOpen) {
    dispatch("displayToggle", { section: listId, open: listOpen });
  }
  function toggleOpen(e) {
    listOpen = !listOpen;
    dispatchListToggle(id, listOpen);
  }

  // updateGlobalUserData($motifStore, "motifs");
</script>

<style>
  h2 {
    cursor: pointer;
  }
  section {
    margin-top: 0px;
    flex-direction: column;
  }
  section[data-closed="true"] {
    flex-direction: row;
    border: 1px solid var(--theme_color_6);
    padding: 10px;
  }
</style>

<section {id} class="sidebar motifs" data-closed={!listOpen}>
  <h2 on:click={toggleOpen}>My Motifs ({motifs.length})</h2>
  {#if listOpen}
    <MotifControls />
    <div class="select-all">
      <input type="checkbox" id="select-all" data-action="multi" value="off" />
      <label for="select-all">select all</label>
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
          {transformations} />
      {/each}
    </ol>
  {/if}

</section>
