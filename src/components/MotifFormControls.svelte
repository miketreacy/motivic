<script>
    import { fade } from 'svelte/transition'
    export let formOpen = false
    export let formInDefaultState = true
    export let formInPresetState = false
    export let formCanSubmit = false
    export let toggleFormFn = () => null
    export let resetFormFn = () => null
    export let submitFormFn = () => null
    export let saveSettingsFn = () => null
    export let controls = []
    export let scrollDown = false
    export let sticky = false
    export let loading = false
    let iconMap = {
        randomizer: ['&#9861;'],
        transformer: ['&#10226;']
    }
</script>

<style>
    .form-controls {
        flex-direction: row !important;
        border-style: none;
        padding: 10px;
        margin: 0px;
        display: flex;
        transition: background-color 0.5s ease;
        background-color: var(--theme_color_2);
        border-radius: 5px;
    }
    .form-controls.open {
        width: 100%;
    }
    .form-controls.sticky {
        position: sticky;
        position: -webkit-sticky;
        top: 59px;
    }

    .form-controls.sticky.scrolldown {
        top: 0px;
        padding: 5px;
        z-index: var(--front);
        border: 1px solid var(--theme_color_1);
    }

    .form-controls[data-closed='true'] {
        padding: 0;
        margin: 0;
    }
    button {
        flex-direction: row;
        flex: 1 1 0;
        border-style: none;
        padding: 0 12px;
        margin: 5px;
        max-width: 50px;
        min-width: 50px;
        transition: background-color 0.5s ease;
    }

    .form-controls.open button {
        max-width: 100px;
    }

    .loading button {
        cursor: wait;
    }
    /*Desktop*/
    @media (min-width: 1025px) {
        .form-controls.open.sticky.scrolldown {
            width: 70%;
        }
    }
</style>

<div
    class="form-controls"
    class:open={formOpen}
    class:loading
    class:scrolldown={scrollDown && formOpen}
    class:sticky={formOpen && sticky}
    data-closed={!formOpen}
    in:fade>
    {#if controls.includes('toggle')}
        <button class="toggle" on:click={toggleFormFn}>
            {formOpen ? 'close' : 'open'}
        </button>
    {/if}
    {#if controls.includes('reset')}
        <button
            class="reset"
            on:click={resetFormFn}
            disabled={formInDefaultState}>
            reset
        </button>
    {/if}
    {#if formOpen && controls.includes('save-settings')}
        <button
            class="save-settings"
            on:click={saveSettingsFn}
            disabled={formInDefaultState || formInPresetState}>
            save setting
        </button>
    {/if}
    {#if controls.includes('submit')}
        <button
            class="submit"
            on:click={submitFormFn}
            disabled={!formCanSubmit}>
            {#if loading}
                <div class="spinner" transition:fade />
            {:else}
                <span>go</span>
            {/if}
        </button>
    {/if}
</div>
