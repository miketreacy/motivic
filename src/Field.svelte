<script>
  import { createEventDispatcher } from "svelte";
  import Input from "./Input.svelte";
  const dispatch = createEventDispatcher();
  export let type = "";
  export let apiField = true;
  export let id = "";
  export let label = "";
  export let required = true;
  export let options = [];
  export let min = 0;
  export let max = 8;
  export let step = 1;
  export let value = null;
  export let accept = "";
  export let wrap = true;
  export let form = "";
</script>

<style>
  .input-wrap {
    flex-direction: row;
    padding: 0px;
    height: 40px;
    width: 100%;
    position: relative;
    justify-content: space-between;
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
      <label for={id}>{label}</label>
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
      on:inputValueChange />
  </div>
{:else}
  {#if label}
    <label for={id}>{label}</label>
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
    on:inputValueChange />
{/if}
