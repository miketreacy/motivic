<script>
  import Utils from "./Utils";
  export let item = null;
  export let type = "";
  export let submitCallback = Function.prototype;
  function saveItem() {
    Utils.userData.store(item, type, false);
    submitCallback();
  }
</script>

<style>

</style>

<div id="save-motif-form">
  <h3>Save {Utils.general.singularize(type)}</h3>
  <fieldset id="save-motif">
    <div class="input-wrap name">
      <label for="motif_name">name</label>
      <input
        type="text"
        max="16"
        class="name"
        id="motif_name"
        value={item.name}
        placeholder={item.name} />
    </div>
    <button class="submit" on:click={saveItem}>submit</button>
  </fieldset>
</div>
