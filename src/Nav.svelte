<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let show = false;
  export let view = "";
  let displayClass = "";
  function selectView(event) {
    view = event.target.dataset.view;
    show = false;
  }
  function dispatchViewChange(view) {
    dispatch("viewChange", { view });
  }

  $: {
    displayClass = show ? "show" : "";
    dispatchViewChange(view);
  }
</script>

<style>
  nav {
    position: absolute;
    top: var(--header_offset);
    width: 100vw;
    transform: translate(-140vw, 0);
    transition: transform var(--timing_slow)
      cubic-bezier(0.57, 0.005, 0.325, 1.35) var(--timing_fastest);
    padding: 10px;
    border-bottom: 2px solid var(--theme_color_1);
    z-index: var(--middle);
    background-color: var(--theme_color_4);
  }

  nav.show {
    transform: translate(-10px, 0);
    position: fixed;
  }

  nav ul {
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }

  nav ul button {
    height: 40px;
    width: 100px;
  }

  /*Desktop*/
  @media (min-width: 1025px) {
    :root {
      --header_offset: 113px;
      --nav_offset: 0px;
    }

    nav {
      position: fixed;
      justify-content: center;
      transform: translate(0, 0);
      transition: none;
    }
  }
</style>

<nav class={displayClass}>
  <ul>
    <li>
      <button data-view="about" on:click={selectView}>about</button>
    </li>
    <!--HIDING NOTE GRID FOR NOW-->
    <!--<li>-->
    <!--<button data-view="note-grid">note grid</button>-->
    <!--</li>-->
    <li>
      <button data-view="studio" on:click={selectView}>studio</button>
    </li>
    <li>
      <button data-view="motifs" on:click={selectView}>motifs</button>
    </li>
    <!--<li>-->
    <!--<button data-view="settings">settings</button>-->
    <!--</li>-->
  </ul>
</nav>
