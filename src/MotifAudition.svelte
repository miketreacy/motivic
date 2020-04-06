<script>
  import { createEventDispatcher } from "svelte";
  import AudioControls from "./AudioControls.svelte";
  import CrudControls from "./CrudControls.svelte";
  export let motif;
  const dispatch = createEventDispatcher();

  function dismissAudition() {
    dispatch("toggleMotifAudition", { motif: null });
  }
</script>

<style>
  .motif-audition {
    position: relative;
    padding: 10px;
    background-color: var(--theme_color_4);
    border-radius: 5px;
  }
  .new-motif {
    height: 45px;
    color: var(--theme_color_6);
  }
  .new-motif span {
    display: flex;
  }
  .motif-name {
    padding-left: 5px;
    font-style: italic;
    font-weight: bold;
    color: var(--theme_color_3);
  }
  .dismiss {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
  }

  .motif-controls {
    justify-content: space-between;
  }
</style>

<div class="motif-audition">
  <div class="new-motif">
    <span>audition:</span>
    <span class="motif-name">{motif.name}</span>
    <button class="dismiss" on:click={dismissAudition}>X</button>
  </div>

  <div class="motif-controls">
    <AudioControls
      displayIcons={false}
      displayCompact={true}
      selectedMotifs={[motif]}
      on:displayAlert />
    <CrudControls
      displayIcons={false}
      displayCompact={true}
      type="motifs"
      saveMode="local"
      selectedItems={[motif]}
      on:displayCrudModal />
  </div>
</div>
