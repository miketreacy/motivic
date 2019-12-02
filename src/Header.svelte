<script>
    import Nav from './Nav.svelte'
    const toggleNavMenu = () => showNav = !showNav;
    export let showNav = false;


</script>
<header class="show">
    <button id="menu" on:click={toggleNavMenu}><span>&#9776;</span></button>
    <h1><a href="/">Motivic</a></h1>
    <!--HIDING USER ACCOUNT FOR NOW-->
    <!--<button id="user"><span>user</span></button>-->
    <!--<section id="user-account">-->
    <!--<button id="account-create">create</button>-->
    <!--<button id="account-login">login</button>-->
    <!--<button id="account-logout">logout</button>-->
    <!--</section>-->
    <button id="upload-toggle"><span>&#8679;</span></button>
    <p class="subtitle">
        <span class="icons">&#9836;</span>tools for composers<span class="icons">&#9836;</span>
    </p>
    <div class="upload-controls input-wrap hide">
        <label for="upload">Upload file (MIDI or JSON)</label>
        <input id="upload" type="file" accept=".json, .midi, .mid"/>
    </div>
    <Nav show={showNav}></Nav>
</header>

<style>
    :root {
    --layout_desktop_width: 1025px;
    }
    header {
        box-sizing: border-box;
        display: flex;
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

    button#user, button#upload-toggle {
        right: 10px;
        top: 10px;
    }

    .scrolldown header > * {
        display: none;
    }

    .scrolldown header h1, .scrolldown header button {
        display: flex;
    }

    /*Desktop*/
    @media (min-width: 1025px) {

        .scrolldown header > * {
            display: flex;
        }
    }
</style>