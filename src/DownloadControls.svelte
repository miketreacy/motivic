<script>
  import Utils from "./Utils.js";
  import Config from "./Config.js";
  import Input from "./Input.svelte";
  export let selectedMotifs = [];
  let fileType;

  function downloadFile(e) {
    Utils.file[fileType].download.bind(Utils.file[fileType])(selectedMotifs);
  }
</script>

<style>
  div {
    width: 100%;
    border-radius: 5px;
    background-color: var(--theme_color_1);
  }
  button {
    flex-direction: column;
    flex: 1 1 0;
    width: 100%;
    font-size: var(--theme_font_size_3);
  }
  select {
    flex: 1 1 0;
    width: 100%;
    font-size: var(--theme_font_size_2);
  }
</style>

<div class="download-controls">
  <select bind:value={fileType}>
    {#each Config.downloadFileTypes as fileType}
      <option>{fileType}</option>
    {/each}
  </select>
  <button class="wav" on:click={downloadFile}>
    <span>&#8681;</span>
  </button>
</div>
