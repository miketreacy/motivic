<script>
  import { createEventDispatcher } from "svelte";
  import { motifStore, settingStore } from "./Stores.js";
  import Config from "./Config.js";
  import Header from "./Header.svelte";
  import Main from "./Main.svelte";
  import Footer from "./Footer.svelte";
  import Modal from "./Modal.svelte";
  import ItemCrudModal from "./ItemCrudModal.svelte";

  export let view = "";
  export let openSection = "";

  const dispatch = createEventDispatcher();
  let motifs = [];
  let selectedMotifIds;
  let allSelected;
  let settings = [];
  let modalProps = Object.assign({}, Config.itemCrudModalDefaultProps);
  let displayAlert = false;
  let alertProps = {
    visible: false,
    message: "",
    type: "",
    displayTimeMs: 0,
    dismissable: false
  };
  let scrollPos;
  let scrollDown = false;
  let scrollUp = true;

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

  function handleDisplayToggle(event) {
    console.log(`handleDisplayToggle() called`);
    console.dir(event.detail);
    let section = event.detail.section;
    let open = event.detail.open;
    if (open) {
      openSection = section;
    } else {
      openSection = "";
    }
  }

  function handleMotifSelection(event) {
    let { existingIds, newIds, add } = event.detail;

    if (add) {
      selectedMotifIds = [...new Set([...existingIds, ...newIds])];
    } else {
      selectedMotifIds = existingIds.filter(id => !newIds.includes(id));
    }
  }

  function handleModalDisplay(event) {
    console.log(`handleModalDisplay() called (App.svelte)`);
    console.dir(event.detail);
    modalProps = Object.assign(modalProps, event.detail.modalProps);
    // de-select everything when modal is displayed
    selectedMotifIds = [];
  }

  function handleViewChange(event) {
    view = event.detail.view;
  }

  function handleDisplayAlert(event) {
    console.log(`handleDisplayAlert() called`);
    console.dir(event.detail);
    alertProps = event.detail;
    displayAlert = alertProps.visible;
  }

  function scrollHandler(scrollPos) {
    let threshold = 30;
    scrollDown = scrollPos >= threshold;
    scrollUp = scrollPos < threshold;
    console.info(`scrollPos = ${scrollPos}`);
    console.info(`scrollDown = ${scrollDown}`);
    console.info(`scrollUp = ${scrollUp}`);
  }

  $: updateGlobalUserData($motifStore, "motifs");
  $: updateGlobalUserData($settingStore, "settings");
  $: scrollHandler(scrollPos);
</script>

<style>

</style>

<svelte:window bind:scrollY={scrollPos} />

<Header
  {view}
  {motifs}
  {openSection}
  {scrollDown}
  on:viewChange={handleViewChange}
  on:displayToggle={handleDisplayToggle}
  on:displayAlert={handleDisplayAlert} />

<Main
  {view}
  {motifs}
  {openSection}
  {allSelected}
  {selectedMotifIds}
  {settings}
  {displayAlert}
  {alertProps}
  {scrollDown}
  on:displayToggle={handleDisplayToggle}
  on:displayCrudModal={handleModalDisplay}
  on:motifSelection={handleMotifSelection} />
{#if openSection === ''}
  <Footer />
{/if}
{#if modalProps.show}
  <!-- TODO: mount empty Modal here but mount the child content components separately to preserve modal fade in but keep form state clearn -->
  <ItemCrudModal {...modalProps} on:displayCrudModal={handleModalDisplay} />
{/if}
