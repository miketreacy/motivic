<script>
  export let formId = "";
  export let formTitle = "";
  export let formInfo = "";
  let iconMap = {
    randomizer: ["&#9861;"],
    transformer: ["&#10226;"]
  };
</script>

<style>

</style>

<h2>
  <span class="icons">
    {@html iconMap[formId]}
  </span>
  {formTitle}
  <span class="icons">
    {@html iconMap[formId]}
  </span>
</h2>
<p class="info">{formInfo}</p>
