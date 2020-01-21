<script>
  import Utils from "./Utils";
  import Nav from "./Nav.svelte";
  import Field from "./Field.svelte";

  export let showNav = false;
  export let showUpload = false;
  export let view = "";
  const fileUploadField = {
    type: "file",
    id: "upload",
    label: "Upload file (MIDI or JSON)",
    accept: ".json, .midi, .mid"
  };
  function toggleNavMenu() {
    showNav = !showNav;
    if (showNav) {
      showUpload = false;
    }
  }
  function toggleUploadMenu() {
    showUpload = !showUpload;
    if (showUpload) {
      showNav = false;
    }
  }
  function uploadFile(event) {
    let files = event.detail.value;
    let file = files[0];
    let reader = new FileReader();
    let fileName = file.name.split(".")[0];
    let fileType = file.name.split(".")[1];
    if (fileType === "json") {
      reader.addEventListener("load", Utils.file.json.handler(fileName));
      reader.readAsText(file);
    } else if (fileType === "midi" || fileType === "mid") {
      reader.addEventListener("load", Utils.file.midi.handler(fileName));
      reader.readAsDataURL(file);
    }
  }
</script>

<style>
  :root {
    --layout_desktop_width: 1025px;
  }
  header {
    box-sizing: border-box;
    display: flex;
    z-index: var(--middle);
  }

  header {
    background-color: var(--theme_color_4);
    position: fixed;
    width: 100vw;
    z-index: var(--middle);
    padding: 10px;
    flex-direction: column;
    min-width: inherit;
  }

  header {
    border-bottom: 2px solid var(--theme_color_1);
  }

  header button {
    position: absolute;
    margin: 4px 10px 10px;
    height: 30px;
    width: 40px;
  }

  .upload-controls {
    flex-direction: column;
    height: auto;
  }

  .upload-controls label,
  .upload-controls input {
    position: static;
  }

  button#user,
  button#upload-toggle {
    right: 10px;
    top: 10px;
  }

  .scrolldown header > * {
    display: none;
  }

  .scrolldown header h1,
  .scrolldown header button {
    display: flex;
  }

  .subtitle {
    font-style: italic;
    display: none;
  }

  .subtitle .icons {
    font-style: normal;
  }

  /*Desktop*/
  @media (min-width: 1025px) {
    .scrolldown header > * {
      display: flex;
    }

    .upload-controls {
      display: flex;
      position: absolute;
      right: 15vw;
      width: auto;
      top: 5px;
    }

    .subtitle {
      display: flex;
    }
  }
</style>

<header class="show">
  <button id="menu" on:click={toggleNavMenu}>
    <span>&#9776;</span>
  </button>
  <h1>
    <a href="/">Motivic</a>
  </h1>
  <!--HIDING USER ACCOUNT FOR NOW-->
  <!--<button id="user"><span>user</span></button>-->
  <!--<section id="user-account">-->
  <!--<button id="account-create">create</button>-->
  <!--<button id="account-login">login</button>-->
  <!--<button id="account-logout">logout</button>-->
  <!--</section>-->
  <button id="upload-toggle" on:click={toggleUploadMenu}>
    <span>&#8679;</span>
  </button>
  <p class="subtitle">
    <span class="icons">&#9836;</span>
    tools for composers
    <span class="icons">&#9836;</span>
  </p>
  {#if showUpload}
    <Field {...fileUploadField} on:valueChange={uploadFile} />
  {/if}
  <!-- Hiding nav due to new SPA approach - no need for page-like paradigm to navigate views -->
  <!-- <Nav show={showNav} {view} on:viewChange /> -->
</header>
