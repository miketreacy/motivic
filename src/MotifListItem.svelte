<script>
  import { createEventDispatcher } from "svelte";
  export let id = "";
  export let name = "";
  export let role = "";
  export let parent = "";
  export let saved = { local: false, cloud: false };
  export let variations = [];
  export let transformations = [];
  export let notes = [];
  export let tempo = { type: "", units: 0 };
  export let selected = false;
  const dispatch = createEventDispatcher();
  function dispatchMotifSelection(selected) {
    dispatch("motifSelection", {
      selected,
      ids: [id]
    });
  }

  $: {
    dispatchMotifSelection(selected);
  }
</script>

<style>
  .motif {
    border: 1px solid var(--theme_color_7);
    padding: 7px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(2, auto);
    grid-column-gap: 2px;
    grid-row-gap: 2px;
    justify-items: stretch;
    width: 100%;
    margin: 5px 0;
  }

  .motif div {
    padding: 0px;
  }

  .motif .saved {
    display: flex;
    align-items: center;
    padding: 2px;
    color: var(--theme_color_1);
    font-size: var(--theme_font_size_1);
    grid-column: 5 / span 1;
    grid-row: 1 / span 1;
  }

  .motif .name {
    padding-top: 5px;
    grid-column: 2 / span 4;
    grid-row: 1 / span 1;
    cursor: text;
  }

  .motif .id {
    grid-column: 2 / span 4;
    grid-row: 2 / span 1;
    font-size: var(--theme_font_size_1);
  }

  .motif .motif-display {
    grid-column: 1 / span 6;
    grid-row: 2 / span 1;
  }

  .motif .rename {
    padding-top: 5px;
    grid-column: 3 / span 2;
    grid-row: 1 / span 1;
  }

  .motif .name,
  .motif .rename input {
    font-size: var(--theme_font_size_2);
  }

  variations .motif .name,
  .variations .motif .transformations,
  .variations .motif .rename input {
    font-size: var(--theme_font_size_1);
  }

  .motif .remove {
    grid-column: 6 / span 1;
    grid-row: 1 / span 1;
    margin: 0;
    max-height: 10px;
    justify-self: end;
    padding: 0 10px;
  }

  .transformations-header {
    display: none;
    grid-column: 3 / span 2;
    grid-row: 3 / span 1;
    align-items: flex-start;
  }

  .transformations {
    display: none;
    grid-column: 2 / span 4;
    grid-row: 4 / span 1;
    align-items: flex-start;
  }

  .variations-header {
    display: none;
    grid-column: 2 / span 2;
    grid-row: 3 / span 1;
    align-items: flex-start;
  }

  .variations {
    display: none;
    grid-column: 2 / span 5;
    grid-row: 4 / span 1;
    align-items: flex-start;
  }

  .selection {
    grid-column: 1 / span 1;
    grid-row: 1 / span 1;
    font-size: 10px;
    font-style: italic;
    flex-direction: column;
    align-items: flex-start;
  }

  .selection label {
    max-height: 20px;
    flex-direction: row;
    align-items: flex-end;
    display: none;
  }

  .selection label span {
    padding-left: 5px;
  }

  .selection label.select-theme {
    display: flex;
    grid-column: 1 / span 1;
    grid-row: 1 / span 1;
  }

  .selection input {
    margin: 0;
  }

  label.select-theme span,
  label.select-all-variations {
    grid-column: 1 / span 1;
    grid-row: 2 / span 1;
    display: none;
  }

  .transformations-header,
  .transformations,
  .variations-header,
  .variations,
  label.select-all-variations {
    display: flex;
  }

  .motif.has-variations > .selection {
    display: grid;
  }

  .motif.has-variations > .selection label {
    align-items: center;
  }

  .motif.has-variations > .selection label.select-theme span {
    display: inline;
  }
</style>

<li class="motif" id="motif_{id}" data-id={id} data-saved="">
  <div class="selection">
    <label class="select-theme">
      <input
        class="select"
        type="checkbox"
        data-action="multi"
        value="off"
        bind:checked={selected} />
      <span>theme</span>
    </label>
    {#if variations.length}
      <label class="select-all-variations">
        <input
          class="select-all-variations"
          type="checkbox"
          data-action="multi"
          bind:checked={selected}
          value="off" />
        <span>variations</span>
      </label>
    {/if}
  </div>
  <h3 class="name">{name}</h3>
  {#if saved.local}
    <span class="saved">(saved)</span>
  {/if}
  <div class="rename hide">
    <input type="text" value="" />
    <button class="rename-cancel">cancel</button>
    <button class="rename-submit">save</button>
  </div>
  <button class="remove">&#9747;</button>
  <div class="motif-display">display motif here</div>
  {#if transformations.length}
    <h4 class="transformations-header">transformations:</h4>
    <ol class="transformations">
      {#each transformations as transformation, i}
        <svelte:self {...transformation} />
      {/each}
    </ol>
  {/if}
  {#if variations.length}
    <h4 class="variations-header">variations:</h4>
    <ol class="variations">
      {#each variations as variation, i}
        <svelte:self {...variation} />
      {/each}
    </ol>
  {/if}
</li>
