<script>
  import { createEventDispatcher } from "svelte";
  import Input from "./Input.svelte";
  const dispatch = createEventDispatcher();
  export let type = "";
  export let apiField = true;
  export let id = "";
  export let label = "";
  export let centerLabel = false;
  export let required = true;
  export let options = [];
  export let min = 0;
  export let max = 8;
  export let step = 1;
  export let value = null;
  export let accept = "";
  export let wrap = true;
  export let form = "";
  export let roughIncrement = 0;
  export let info = "";
</script>

<style>
  .input-wrap {
    flex-direction: row;
    padding: 0px;
    height: 50px;
    width: 100%;
    position: relative;
    justify-content: space-between;
    max-width: var(--max_main_width);
    align-self: center;
  }

  .input-wrap.hidden {
    display: none;
  }

  label {
    display: block;
    padding: 5px;
    flex: 1 1 0;
    text-align: left;
  }
  label.center {
    text-align: center;
  }

  .input-wrap.overlay {
    position: absolute;
    left: 170px;
    width: 80px;
  }

  .input-wrap.name {
    flex-direction: column;
  }

  .input-wrap.name input {
    width: auto;
    text-align: center;
  }
</style>

{#if wrap}
  <div class="input-wrap" class:hidden={type === 'hidden'}>
    {#if label}
      <label class:center={centerLabel} for={id} title={info}>{label}</label>
    {/if}
    <Input
      {form}
      {type}
      {apiField}
      {id}
      {required}
      {options}
      {min}
      {max}
      {step}
      {value}
      {accept}
      {roughIncrement}
      on:inputValueChange
      on:displayAlert />
  </div>
{:else}
  {#if label}
    <label class:center={centerLabel} for={id} title={info}>{label}</label>
  {/if}
  <Input
    {form}
    {type}
    {apiField}
    {id}
    {required}
    {options}
    {min}
    {max}
    {step}
    {value}
    {accept}
    {roughIncrement}
    on:inputValueChange
    on:displayAlert />
{/if}
