<script>
  import Header from "./Header.svelte";
  import Main from "./Main.svelte";
  import Footer from "./Footer.svelte";
  export let view = "";
  function handleViewChange(event) {
    view = event.detail.view;
  }
</script>

<style>

</style>

<Header {view} on:viewChange={handleViewChange} />
<Main {view} />
<Footer />
