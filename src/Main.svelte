<script>
  import Alert from "./Alert.svelte";
  import About from "./About.svelte";
  import RandomizerForm from "./RandomizerForm.svelte";
  import TransformerForm from "./TransformerForm.svelte";
  import MotifList from "./MotifList.svelte";
  export let selectedMotifIds = [];
  export let allSelected = false;
  export let view = "";
  export let openSection = "";
  export let motifSelected = false;
  export let settings = [];
  export let motifs = [];
  let viewType = "nested";
  let sortType = "createdTS";
  let sortOrder = "desc";
  let showSectionMap = { motifs: true, randomizer: true, transformer: true };
  let displayAlert = false;
  let alertProps = {
    visible: false,
    message: "",
    type: "",
    displayTimeMs: 0,
    dismissable: false
  };
  function updateDisplayState(openSection) {
    if (openSection) {
      showSectionMap = Object.keys(showSectionMap).reduce((obj, key) => {
        obj[key] = key === openSection;
        return obj;
      }, {});
    } else {
      showSectionMap = Object.keys(showSectionMap).reduce((obj, key) => {
        obj[key] = true;
        return obj;
      }, {});
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
  function handleDisplayAlert(event) {
    console.log(`handleDisplayAlert() called`);
    console.dir(event.detail);
    alertProps = event.detail;
    displayAlert = alertProps.visible;
  }

  function handleListViewChange(event) {
    viewType = event.detail.viewType;
    sortType = event.detail.sortType;
    sortOrder = event.detail.sortOrder;
    console.info(`handleListViewChange() called`);
    console.info(`viewType = ${viewType}`);
    console.info(`sortType = ${sortType}`);
    console.info(`sortOrder = ${sortOrder}`);
  }

  $: updateDisplayState(openSection);
  $: console.info(`openSection: ${openSection}`);
  $: console.dir(showSectionMap);
  $: openSection =
    openSection === "motifs" && !motifs.length ? "" : openSection;
</script>

<style>
  main {
    display: flex;
    z-index: var(--back);
    flex-wrap: wrap;
    flex-direction: column;
    background-color: var(--theme_color_2);
    top: calc(var(--header_offset) + var(--nav_offset));
    position: relative;
    padding: 10px 10px 0;
    margin-bottom: var(--footer_offset);
    width: 100%;
    max-width: 540px;
    align-items: center;
    justify-content: center;
  }
</style>

<main>
  {#if displayAlert}
    <Alert {...alertProps} on:displayAlert={handleDisplayAlert} />
  {/if}

  {#if view === 'about'}
    <About />
  {/if}
  {#if view === 'studio'}
    {#if showSectionMap.motifs}
      <MotifList
        id="motifs"
        title="My Motifs"
        listOpen={openSection === 'motifs'}
        {motifs}
        {selectedMotifIds}
        {allSelected}
        parentId=""
        {viewType}
        {sortType}
        {sortOrder}
        on:listViewChange={handleListViewChange}
        on:displayToggle={handleDisplayToggle}
        on:displayCrudModal
        on:motifSelection
        on:displayAlert={handleDisplayAlert} />
    {/if}

    {#if showSectionMap.randomizer}
      <RandomizerForm
        on:displayToggle={handleDisplayToggle}
        on:displayAlert={handleDisplayAlert}
        on:displayCrudModal />
    {/if}
    {#if showSectionMap.transformer}
      <TransformerForm
        {motifs}
        selectedMotifId={motifs.length ? motifs[0].id : ''}
        on:displayToggle={handleDisplayToggle}
        on:displayAlert={handleDisplayAlert}
        on:displayCrudModal />
    {/if}
  {/if}
</main>
