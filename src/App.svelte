<script>
  import { createEventDispatcher } from "svelte";
  import { motifStore, settingStore } from "./Stores.js";
  import Header from "./Header.svelte";
  import Main from "./Main.svelte";
  import Footer from "./Footer.svelte";
  import Modal from "./Modal.svelte";
  import ItemCrudModal from "./ItemCrudModal.svelte";
  export let view = "";

  const dispatch = createEventDispatcher();

  let motifs = [];
  let selectedMotifIds;
  let allSelected;
  let settings = [];
  let ModalView = "";
  let modalItem = null;
  let modalType = "";
  let modalActionComplete = false;
  let modalFormType = "";
  let defaultModalProps = {
    itemType: "",
    item: null,
    formType: "",
    show: false
  };
  let modalProps = Object.assign({}, defaultModalProps);

  /**
   * Updates user data in memory in the global MOTIVIC namespace and in the component waterfall
   */
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

  function handleModalDisplay(event) {
    console.log(`handleModalDisplay() called (App.svelte)`);
    console.dir(event.detail);
    modalProps = event.detail.modalProps;
    // de-select everything when modal is displayed
    selectedMotifIds = [];
  }

  function handleViewChange(event) {
    view = event.detail.view;
  }

  $: updateGlobalUserData($motifStore, "motifs");
  $: updateGlobalUserData($settingStore, "settings");
</script>

<style>

</style>

<Header {view} on:viewChange={handleViewChange} />
<Main
  {view}
  {motifs}
  {allSelected}
  {selectedMotifIds}
  {settings}
  on:displayCrudModal={handleModalDisplay} />
<Footer />
{#if modalProps.show}
  <!-- TODO: mount empty Modal here but mount the child content componenets separately to preserve modal fade in but keep form state clearn -->
  <ItemCrudModal {...modalProps} on:displayCrudModal={handleModalDisplay} />
{/if}
