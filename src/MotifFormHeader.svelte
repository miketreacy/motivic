<script>
  export let formId = "";
  export let formTitle = "";
  export let formInfo = "";
  export let formOpen = false;
  let showInfo = false;
  let iconMap = {
    uploader: ["&#8679;"],
    randomizer: ["&#9861;"],
    transformer: ["&#10226;"]
  };
</script>

<style>
  div {
    flex-direction: row;
  }
  h2 {
    font-size: var(--theme_font_size_4);
    flex: 1 0 0;
  }
  h2[data-closed="true"] {
    font-size: var(--theme_font_size_2b);
    text-transform: lowercase;
  }
  .icons {
    font-size: var(--theme_font_size_4);
    margin: 0 10px;
  }
</style>

<div>
  {#if formOpen}
    <span class="icons">
      {@html iconMap[formId]}
    </span>
  {/if}
  <h2 data-closed={!formOpen}>
    <!-- {#if formOpen}
    <span class="icons">
      {@html iconMap[formId]}
    </span>
  {/if} -->
    {formTitle}
    <!-- {#if formOpen}
    <span class="icons">
      {@html iconMap[formId]}
    </span>
  {/if} -->
  </h2>
  {#if formOpen}
    <span class="icons">
      {@html iconMap[formId]}
    </span>
  {/if}
  {#if formOpen && showInfo}
    <p class="info">{formInfo}</p>
  {/if}
</div>
