<script>
  import About from "./About.svelte";
  import SelectedMotif from "./SelectedMotif.svelte";
  import RandomizerForm from "./RandomizerForm.svelte";
  import TransformerForm from "./TransformerForm.svelte";
  import MotifList from "./MotifList.svelte";
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
  $: {
    updateDisplayState(openSection);
  }
</script>

<style>
  main {
    display: flex;
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
      <MotifList {motifs} on:displayToggle={handleDisplayToggle} />
    {/if}
    {#if !openSection}
      <!-- <SelectedMotif {motifSelected} /> -->
    {/if}
    {#if showSectionMap.randomizer}
      <RandomizerForm on:displayToggle={handleDisplayToggle} />
    {/if}
    {#if showSectionMap.transformer}
      <TransformerForm on:displayToggle={handleDisplayToggle} />
    {/if}
  {/if}
</main>
