<script>
  import Utils from "./Utils.js";
  import Config from "./Config.js";
  import Field from "./Field.svelte";
  import Input from "./Input.svelte";
  import AudioControls from "./AudioControls.svelte";
  import CrudControls from "./CrudControls.svelte";
  import DownloadControls from "./DownloadControls.svelte";

  export let selectedMotifs = [];
  let type = "motifs";
</script>

<style>
  .motif-controls {
    background-color: var(--theme_color_2);
    flex: none;
    flex-direction: column;
    flex-wrap: wrap;
    padding: 0;
    border: 2px solid var(--theme_color_6);
  }
</style>

<!--TODO: split this out into one universal motif-play-control section (play, loop, voice)-->
<!--TODO: and one universal motif crud section (local save, )-->
<!--TODO: this section defines what you can do with a newly-created motif (note-grid, randomize, upload)-->
<section class="motif-controls">
  <!--TODO: convert this to a <fieldset> so I can disable them all at once-->
  <AudioControls {selectedMotifs} />
  <CrudControls {selectedMotifs} {type} on:displayModal />
  <DownloadControls {selectedMotifs} />
</section>
