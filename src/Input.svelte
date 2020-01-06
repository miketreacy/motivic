<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let type = "";
  export let apiField = true;
  export let id = "";
  export let required = true;
  export let options = [];
  export let min = 0;
  export let max = 8;
  export let step = 1;
  export let value = null;
  export let accept = "";
  export let form = "";
  export let displayClass = "display-block";

  function dispatchValueChange(val) {
    if (apiField) {
      dispatch("inputValueChange", { value: val, field: id, form });
    }
  }

  $: {
    dispatchValueChange(value);
  }
</script>

<style>
  input,
  select {
    display: block;
    cursor: pointer;
    color: var(--theme_color_2);
    font-size: var(--theme_font_size_2);
    background-color: var(--theme_color_1);
    border: none;
    border-radius: 5px;
    min-height: 30px;
    outline: none;
    padding: 5px;
    height: 30px;
    border: 1px solid var(--theme_color_10);
    width: 40%;
    margin: 0;
    flex: 1 1 0;
  }
  .display-flex {
    display: flex;
  }

  input:focus {
    outline: none;
  }

  input[type="checkbox"] {
    width: 40px;
  }

  input[type="file"] {
    width: auto;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

{#if type == 'select'}
  <select class={displayClass} {id} bind:value {required}>
    {#each options as opt}
      <option>{opt}</option>
    {/each}
  </select>
{:else if type == 'number'}
  <input
    type="number"
    {id}
    class={displayClass}
    bind:value
    {required}
    {min}
    {max}
    {step}
    inputmode="numeric"
    pattern="[0-9]*" />
{:else if type == 'text'}
  <input
    type="text"
    {id}
    class={displayClass}
    bind:value
    placeholder={value}
    {max}
    {required} />
{:else if type == 'checkbox'}
  <input
    type="checkbox"
    {id}
    class={displayClass}
    bind:checked={value}
    {required} />
{:else if type == 'file'}
  <input type="file" {id} class={displayClass} {accept} bind:files={value} />
{:else if type == 'hidden'}
  <input type="hidden" {id} class={displayClass} bind:value />
{/if}
