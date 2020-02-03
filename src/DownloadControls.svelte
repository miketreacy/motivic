<script>
  import Utils from "./Utils.js";
  import Config from "./Config.js";
  import Input from "./Input.svelte";

  export let saveMode = "local";
  export let selectedMotifs = [];

  function downloadFileHandler(fileType) {
    return function downloadFile(e) {
      Utils.file[fileType].download.bind(Utils.file[fileType])(selectedMotifs);
    };
  }
</script>

<style>
  div {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }
  button {
    flex-direction: column;
    flex: 1 1 0;
    height: 40px;
    max-width: 60px;
    font-size: var(--theme_font_size_1);
  }
</style>

<div class="download-controls">
  <button class="wav" on:click={downloadFileHandler('wav')}>
    <span>&#8681;</span>
    <span>WAV</span>
  </button>
  <button class="midi" on:click={downloadFileHandler('midi')}>
    <span>&#8681;</span>
    <span>MIDI</span>
  </button>
  <button class="json" on:click={downloadFileHandler('json')}>
    <span>&#8681;</span>
    <span>JSON</span>
  </button>
</div>
