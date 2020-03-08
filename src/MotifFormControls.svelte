<script>
  export let formOpen = false;
  export let formInDefaultState = true;
  export let formCanSubmit = false;
  export let toggleFormFn = () => null;
  export let resetFormFn = () => null;
  export let submitFormFn = () => null;
  export let controls = [];
  let iconMap = {
    randomizer: ["&#9861;"],
    transformer: ["&#10226;"]
  };
</script>

<style>
  .form-controls {
    flex-direction: row !important;
    border-style: none;
    padding: 10px;
    margin: 0px;
    display: flex;
    flex-direction: column;
    transition: background-color 0.5s ease;
  }

  .form-controls[data-closed="true"] {
    padding: 0;
    margin: 0;
  }

  button {
    flex-direction: row;
    flex: 1 1 0;
    border-style: none;
    padding: 4px 12px 6px;
    margin: 5px;
    max-width: 45px;
    transition: background-color 0.5s ease;
  }
</style>

<div class="form-controls" data-closed={!formOpen}>
  {#if controls.includes('toggle')}
    <button class="toggle" on:click={toggleFormFn}>
      {formOpen ? 'close' : 'open'}
    </button>
  {/if}
  {#if controls.includes('reset')}
    <button class="reset" on:click={resetFormFn} disabled={formInDefaultState}>
      reset
    </button>
  {/if}
  {#if controls.includes('apply')}
    <button class="apply" on:click={submitFormFn} disabled={!formCanSubmit}>
      <span>apply</span>
    </button>
  {/if}
</div>
