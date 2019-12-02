<script>
  import RandomizerForm from "./RandomizerForm.svelte";
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
  <RandomizerForm />
</main>
