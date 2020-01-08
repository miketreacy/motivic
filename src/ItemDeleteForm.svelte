<script>
  import Utils from "./Utils";
  export let item = null;
  export let type = "";
  export let submitCallback = Function.prototype;
  function deleteItem() {
    Utils.userData.remove(item, type, false);
    submitCallback();
  }
</script>

<style>

</style>

<div>
  <h3>Delete {Utils.general.singularize(type)}</h3>
  <fieldset id="delete-motif">
    <div class="input-wrap name">
      Do you really want to delete {item.name} ID: {item.id}?
    </div>
    <button class="submit" on:click={deleteItem}>delete</button>
  </fieldset>
</div>
