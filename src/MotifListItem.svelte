<script>
  export let id = "";
  export let name = "";
  export let saved = false;
  export let variations = [];
  export let transformations = [];
</script>

<style>

</style>

<li class="user_motif motif" id="user-motif" data-id="" data-saved="">
  <div class="selection">
    <label class="select-theme">
      <input class="select" type="checkbox" data-action="multi" value="off" />
      <span>theme</span>
    </label>
    <label class="select-all-variations">
      <input
        class="select-all-variations"
        type="checkbox"
        data-action="multi"
        value="off" />
      <span>variations</span>
    </label>
  </div>
  <h3 class="name" />
  <span class="saved">😎(saved)😎</span>
  <div class="rename hide">
    <input type="text" value="" />
    <button class="rename-cancel">cancel</button>
    <button class="rename-submit">save</button>
  </div>
  <button class="remove">&#9747;</button>
  <div class="motif-display" />
  <h4 class="transformations-header">transformations:</h4>
  <ol class="transformations" />
  <h4 class="variations-header">variations:</h4>
  <ol class="variations" />
</li>
