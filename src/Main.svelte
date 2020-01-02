<script>
  import About from "./About.svelte";
  import SelectedMotif from "./SelectedMotif.svelte";
  import RandomizerForm from "./RandomizerForm.svelte";
  import TransformerForm from "./TransformerForm.svelte";
  export let view = "";
  export let motifSelected = false;
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

    <RandomizerForm />
    <TransformerForm />
  {/if}
</main>
