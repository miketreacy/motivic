<script>
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
  let showSectionMap = { motifs: true, randomizer: true, transformer: true };
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
    let section = event.detail.section;
    let open = event.detail.open;
    if (open) {
      openSection = section;
    } else {
      openSection = "";
    }
  }
  $: updateDisplayState(openSection);
  $: console.info(`openSection: ${openSection}`);
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
  {#if view === 'about'}
    <About />
  {/if}
  {#if view === 'studio'}
    {#if showSectionMap.motifs}
      <MotifList
        id="motifs"
        {motifs}
        {selectedMotifIds}
        {allSelected}
        on:displayToggle={handleDisplayToggle}
        on:displayCrudModal />
    {/if}

    {#if showSectionMap.randomizer}
      <RandomizerForm on:displayToggle={handleDisplayToggle} />
    {/if}
    {#if showSectionMap.transformer}
      <TransformerForm
        {motifs}
        selectedMotifId={motifs.length ? motifs[0].id : ''}
        on:displayToggle={handleDisplayToggle} />
    {/if}
  {/if}
</main>
