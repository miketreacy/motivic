<script>
  export let formId = "";
  export let formOpen = false;
  export let formInDefaultState = true;
  export let toggleFormFn = () => null;
  export let resetFormFn = () => null;
  export let submitFormFn = () => null;
  let iconMap = {
    randomizer: ["&#9861;"],
    transformer: ["&#10226;"]
  };
</script>

<style>

</style>

<div class="form-controls">
  <button class="section-toggle" on:click={toggleFormFn}>
    {formOpen ? 'close' : 'open'}
  </button>
  <button class="reset" on:click={resetFormFn} disabled={formInDefaultState}>
    reset
  </button>
  <button class="apply" id={formId} on:click={submitFormFn}>
    <span>apply</span>
  </button>
</div>
