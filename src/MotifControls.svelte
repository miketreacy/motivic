<script>
  import AudioControls from "./AudioControls.svelte";

  export let selectedMotifs = [];
  let type = "motifs";

  $: console.log(
    `MotifControls: selectedMotifs = [${selectedMotifs
      .map(m => m.id)
      .join(",")}]`
  );
</script>

<style>
  .motif-controls {
    background-color: var(--theme_color_2);
    flex: none;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0;
    border: 2px solid var(--theme_color_6);
    position: sticky;
    position: -webkit-sticky;
    /* TODO: write a css variable for this offset */
    top: 59px;
    background-color: var(--theme_color_2);
    z-index: var(--front);
  }
</style>

<section class="motif-controls">
  <AudioControls {selectedMotifs} />
</section>
