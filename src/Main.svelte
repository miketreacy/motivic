<script>
  import About from "./About.svelte";
  import SelectedMotif from "./SelectedMotif.svelte";
  import RandomizerForm from "./RandomizerForm.svelte";
  import TransformerForm from "./TransformerForm.svelte";
  export let view = "";
  export let openForm = "";
  export let motifSelected = false;
  let showFormMap = { randomizer: true, transformer: true };
  function updateFormState(openForm) {
    if (openForm) {
      showFormMap = Object.keys(showFormMap).reduce((obj, key) => {
        obj[key] = key === openForm;
        return obj;
      }, {});
    } else {
      showFormMap = Object.keys(showFormMap).reduce((obj, key) => {
        obj[key] = true;
        return obj;
      }, {});
    }
    console.info(`openForm = ${openForm}`);
    console.dir(showFormMap);
  }
  function handleFormToggle(event) {
    let form = event.detail.form;
    let open = event.detail.open;
    if (open) {
      openForm = form;
    } else {
      openForm = "";
    }
  }
  $: {
    updateFormState(openForm);
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
    <SelectedMotif {motifSelected} />
    {#if showFormMap.randomizer}
      <RandomizerForm on:formToggle={handleFormToggle} />
    {/if}
    {#if showFormMap.transformer}
      <TransformerForm on:formToggle={handleFormToggle} />
    {/if}
  {/if}
</main>
