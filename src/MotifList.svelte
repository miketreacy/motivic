<script>
  import MotifListControls from "./MotifListControls.svelte";
  import MotifListItem from "./MotifListItem.svelte";
  export let motifs = [];
</script>

<style>

</style>

<section id="motifs" class="sidebar motifs">
  <MotifListControls />

  <section class="section sidebar show" id="theme">
    <h2>My Motifs</h2>
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
      {#each motifs as motif, i}
        <MotifListItem {motif} />
      {/each}

    </ol>
  </section>
</section>
