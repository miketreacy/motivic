<script>
  export let formId = "";
  export let formTitle = "";
  export let formInfo = "";
  export let formOpen = false;
  let iconMap = {
    randomizer: ["&#9861;"],
    transformer: ["&#10226;"]
  };
</script>

<style>
  h2 {
    flex: 1 1 0;
  }

  h2[data-closed="true"] {
    text-transform: lowercase;
  }
</style>

<h2 data-closed={!formOpen}>
  {#if formOpen}
    <span class="icons">
      {@html iconMap[formId]}
    </span>
  {/if}
  {formTitle}
  {#if formOpen}
    <span class="icons">
      {@html iconMap[formId]}
    </span>
  {/if}
</h2>
{#if formOpen}
  <p class="info">{formInfo}</p>
{/if}
