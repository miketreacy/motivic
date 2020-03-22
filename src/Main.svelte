<script>
  import Alert from "./Alert.svelte";
  import About from "./About.svelte";
  import UploaderForm from "./UploaderForm.svelte";
  import RandomizerForm from "./RandomizerForm.svelte";
  import TransformerForm from "./TransformerForm.svelte";
  import MotifList from "./MotifList.svelte";
  export let selectedMotifIds = [];
  export let allSelected = false;
  export let view = "";
  export let openSection = "";
  export let settings = [];
  export let motifs = [];
  export let scrollDown = false;
  let viewType = "flat";
  let sortType = "created";
  let sortOrder = "desc";
  let expandedMotifId = "";
  const defaultShowSectionMap = {
    motifs: false,
    uploader: true,
    randomizer: true,
    transformer: true
  };
  let showSectionMap = Object.assign({}, defaultShowSectionMap);

  export let displayAlert = false;
  export let alertProps = {
    visible: false,
    message: "",
    type: "",
    displayTimeMs: 0,
    dismissable: false,
    top: 0,
    displayLabel: true
  };
  function updateDisplayState(openSection) {
    if (openSection) {
      showSectionMap = Object.keys(showSectionMap).reduce((obj, key) => {
        obj[key] = key === openSection;
        return obj;
      }, {});
    } else {
      showSectionMap = Object.assign({}, defaultShowSectionMap);
    }
  }
  function handleDisplayAlert(event) {
    alertProps = event.detail;
    displayAlert = alertProps.visible;
  }

  function handleListViewChange(event) {
    viewType = event.detail.viewType;
    sortType = event.detail.sortType;
    sortOrder = event.detail.sortOrder;
    // Only expand the motif when the expandedMotifId value changes explicitly,
    // otherwise close the expanded motif on all other list-view event types.
    expandedMotifId =
      event.detail.expandedMotifId === expandedMotifId
        ? ""
        : event.detail.expandedMotifId;
    motifs = motifs;
    console.info(`handleListViewChange() called`);
    console.info(`viewType = ${viewType}`);
    console.info(`sortType = ${sortType}`);
    console.info(`sortOrder = ${sortOrder}`);
    console.info(`expandedMotifId = ${expandedMotifId}`);
  }

  $: updateDisplayState(openSection);
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
    position: relative;
    padding: 10px;
    width: 100%;
    max-width: var(--max_main_width);
    align-items: center;
    justify-content: center;
  }
  #tools-wrap {
    width: 100%;
    margin-top: 0vh;
  }
  #tools-wrap.closed {
    margin-top: 10vh;
  }
</style>

<main>
  {#if displayAlert}
    <Alert {...alertProps} on:displayAlert={handleDisplayAlert} />
  {/if}

  {#if view === 'about'}
    <About />
  {/if}
  {#if view === 'home'}
    <div id="tools-wrap" class:closed={openSection === ''}>
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
          {expandedMotifId}
          {scrollDown}
          on:listViewChange={handleListViewChange}
          on:displayToggle
          on:displayCrudModal
          on:motifSelection
          on:displayAlert={handleDisplayAlert} />
      {/if}
      {#if showSectionMap.randomizer}
        <RandomizerForm
          formOpen={openSection === 'randomizer'}
          on:displayToggle
          on:displayAlert={handleDisplayAlert}
          on:displayCrudModal />
      {/if}
      {#if showSectionMap.uploader}
        <UploaderForm
          formOpen={openSection === 'uploader'}
          on:displayToggle
          on:displayAlert={handleDisplayAlert}
          on:displayCrudModal />
      {/if}
      {#if showSectionMap.transformer && motifs.length}
        <TransformerForm
          formOpen={openSection === 'transformer'}
          {motifs}
          selectedMotifId={motifs.length ? motifs[0].id : ''}
          on:displayToggle
          on:displayAlert={handleDisplayAlert}
          on:displayCrudModal />
      {/if}
    </div>
  {/if}
</main>
