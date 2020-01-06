<script>
  import { motifStore, settingStore } from "./Stores.js";
  import Header from "./Header.svelte";
  import Main from "./Main.svelte";
  import Footer from "./Footer.svelte";
  export let view = "";
  let motifs = [];
  let settings = [];

  function updateGlobalUserData(items, type) {
    let initGlobal = window.MOTIVIC || { user: { motifs: [], settings: [] } };
    initGlobal.user[type] = items;
    window.MOTIVIC = initGlobal;
    if (type === "motifs") {
      motifs = items;
    }
    if (type === "settings") {
      settings = items;
    }
  }

  function handleViewChange(event) {
    view = event.detail.view;
  }
  $: {
    updateGlobalUserData($motifStore, "motifs");
    updateGlobalUserData($settingStore, "settings");
  }
</script>

<style>

</style>

<Header {view} on:viewChange={handleViewChange} />
<Main {view} {motifs} {settings} />
<Footer />
