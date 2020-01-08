<script>
  import { createEventDispatcher } from "svelte";
  import { motifStore, settingStore } from "./Stores.js";
  import Header from "./Header.svelte";
  import Main from "./Main.svelte";
  import Footer from "./Footer.svelte";
  import Modal from "./Modal.svelte";
  export let view = "";

  const dispatch = createEventDispatcher();

  let motifs = [];
  let settings = [];
  let showModal = false;
  let ModalView = "";
  let modalItem = null;
  let modalType = "";

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
    if (event.detail.display) {
      ModalView = event.detail.view;
      modalItem = event.detail.item;
      modalType = event.detail.type;
      showModal = true;
    } else {
      showModal = false;
      ModalView = "";
      modalItem = null;
      modalType = "";
    }
  }

  function dismissModal() {
    showModal = false;
    ModalView = "";
    modalItem = null;
    modalType = "";
  }

  function dispatchDismissModal() {
    dispatch("displayModal", {
      display: false
    });
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
<Main {view} {motifs} {settings} on:displayModal={handleModalDisplay} />
<Footer />
{#if showModal}
  <Modal on:displayModal={handleModalDisplay}>
    <ModalView
      item={modalItem}
      type={modalType}
      submitCallback={dismissModal}
      on:displayModal />
  </Modal>
{/if}
