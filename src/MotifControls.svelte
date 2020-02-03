<script>
  import Utils from "./Utils.js";
  import Config from "./Config.js";
  import Field from "./Field.svelte";
  import Input from "./Input.svelte";
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
    flex-direction: column;
    flex-wrap: wrap;
    padding: 0;
    border: 2px solid var(--theme_color_6);
    position: sticky;
    /* TODO: write a css variable for this offset */
    top: 58px;
    background-color: var(--theme_color_2);
    z-index: var(--front);
  }
</style>

<!--TODO: split this out into one universal motif-play-control section (play, loop, voice)-->
<!--TODO: and one universal motif crud section (local save, )-->
<!--TODO: this section defines what you can do with a newly-created motif (note-grid, randomize, upload)-->
<section class="motif-controls">
  <AudioControls {selectedMotifs} />
  <!-- moving these to indovidal motif items because they can't be batched-->
  <!-- <CrudControls selectedItems={selectedMotifs} {type} on:displayCrudModal />
  <DownloadControls {selectedMotifs} /> -->
</section>
