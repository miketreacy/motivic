<script>
  export let motifSelected = false;
</script>

<style>

</style>

<section id="selected-motif" class="show">
  <div class="input-wrap">
    <label for="select-motif">selected motif:</label>
    <select
      id="select-motif"
      name="selected-motif"
      data-default="new unnamed"
      data-action="single" />
    {#if motifSelected}
      <button id="select-motif-reset">clear</button>
    {/if}
  </div>
</section>
