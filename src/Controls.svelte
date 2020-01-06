<script>
  import Config from "./Config.js";
  import Field from "./Field.svelte";
  import Input from "./Input.svelte";
  export let saveMode = "local";
</script>

<style>
  .motif-controls {
    display: flex;
    flex-direction: row;
  }
  .motif-controls button,
  .motif-controls input,
  .motif-controls select {
    font-size: var(--theme_font_size_1);
    border: none;
    border-radius: 5px;
    min-height: 30px;
    border-style: none;
    padding: 4px 12px 6px;
    margin: 5px;
    max-width: 120px;
    display: flex;
    flex-direction: column;
    transition: background-color 0.5s ease;
    flex: 1 1 0;
  }
  .motif-controls button:disabled,
  .motif-controls select:disabled,
  .motif-controls input:disabled {
    cursor: not-allowed;
    background-color: var(--theme_color_4);
    color: var(--theme_color_6);
  }
</style>

<!--TODO: split this out into one universal motif-play-control section (play, loop, voice)-->
<!--TODO: and one universal motif crud section (local save, )-->
<!--TODO: this section defines what you can do with a newly-created motif (note-grid, randomize, upload)-->
<!--TODO: convert this to a <fieldset> so I can disable them all at once-->
<div class="motif-controls">
  <slot />
</div>
