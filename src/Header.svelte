<script>
  import { createEventDispatcher } from "svelte";
  import Utils from "./Utils";
  import Nav from "./Nav.svelte";
  import Field from "./Field.svelte";
  export let showNav = false;
  export let showUpload = false;
  export let view = "";
  export let motifs = [];
  export let openSection = "";
  export let scrollDown;
  const dispatch = createEventDispatcher();
  const fileUploadField = {
    type: "file",
    id: "upload",
    label: "Upload file (MIDI or JSON)",
    accept: ".json, .midi, .mid",
    wrap: false
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

  function handleUploadMenuClickAway(e) {
    if (
      !e.target.closest("#upload-toggle") &&
      !e.target.closest(".upload-controls")
    ) {
      showUpload = false;
    }
  }

  function handleUploadedMotifs(results) {
    showUpload = false;
    results.forEach(result => {
      let [success, msg, motif] = result;
      dispatch("displayAlert", {
        visible: true,
        type: success ? "success" : "error",
        message: msg,
        displayTimeMs: 1500,
        dismissable: false
      });
    });
  }
  function uploadFile(event) {
    console.log(`uploadFile() called`);
    console.dir(event.detail);
    let files = event.detail.value;
    let file = files[0];
    let reader = new FileReader();
    let fileName = file.name.split(".")[0];
    let fileType = file.name.split(".")[1];
    if (fileType === "json") {
      reader.addEventListener(
        "load",
        Utils.file.json.uploadHandler(fileName, handleUploadedMotifs)
      );
      reader.readAsText(file);
    } else if (fileType === "midi" || fileType === "mid") {
      reader.addEventListener(
        "load",
        Utils.file.midi.uploadHandler(fileName, handleUploadedMotifs)
      );
      reader.readAsDataURL(file);
    }
  }

  function toggleMotifList(e) {
    if (motifs.length) {
      motifListOpen = !motifListOpen;
      dispatch("displayToggle", { section: "motifs", open: motifListOpen });
    }
  }

  $: motifListOpen = openSection === "motifs";
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
  }

  .upload-controls {
    flex-direction: column;
    height: auto;
  }

  #upload-toggle {
    left: 10px;
    top: 10px;
  }

  #motifs {
    flex-direction: row;
    right: 10px;
    top: 10px;
  }

  .motif-count {
    padding-left: 2px;
    font-size: var(--theme_font_size_2);
  }

  .motif-count.small {
    font-size: var(--theme_font_size_1);
  }

  header.scrolldown {
    padding: 0px;
    border-bottom: none;
  }

  header.scrolldown h1,
  header.scrolldown button {
    display: none;
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
    header.scrolldown h1,
    header.scrolldown button {
      display: flex;
    }

    .upload-controls {
      display: flex;
      position: absolute;
      left: 15vw;
      width: auto;
      top: 5px;
    }

    .subtitle {
      display: flex;
    }
  }
</style>

<svelte:body on:click={handleUploadMenuClickAway} />
<header class="show" class:scrolldown={scrollDown}>
  <!-- <button id="menu" on:click={toggleNavMenu}>
    <span>&#9776;</span>
  </button> -->
  <button id="upload-toggle" on:click={toggleUploadMenu}>
    <span>&#8679;</span>
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
  {#if motifs.length}
    <button id="motifs" on:click={toggleMotifList}>
      <span>&#9835;</span>
      <span class="motif-count" class:small={motifs.length > 9}>
        {motifs.length}
      </span>
    </button>
  {/if}
  <p class="subtitle">
    <span class="icons">&#9836;</span>
    tools for composers
    <span class="icons">&#9836;</span>
  </p>
  {#if showUpload}
    <div class="upload-controls">
      <Field {...fileUploadField} on:inputValueChange={uploadFile} />
    </div>
  {/if}
  <!-- Hiding nav due to new SPA approach - no need for page-like paradigm to navigate views -->
  <!-- <Nav show={showNav} {view} on:viewChange /> -->
</header>
