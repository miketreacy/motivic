<script>
    import { createEventDispatcher } from 'svelte'
    import Config from '../Config'
    export let show = false
    let modal
    let dismissModalProps = Object.assign({}, Config.itemCrudModalDefaultProps)
    const dispatch = createEventDispatcher()

    function dispatchDismissModal() {
        dispatch('displayCrudModal', {
            modalProps: dismissModalProps
        })
    }
</script>

<style>
    .modal-background {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: var(--obscured);
        background-color: rgba(0, 0, 0, 0);
        transition-property: background-color;
        transition-duration: var(--timing_fastest);
        transition-timing-function: linear;
        transition-delay: var(--timing_now);
    }
    .modal-background.show {
        background-color: rgba(0, 0, 0, 0.85);
        z-index: var(--front);
    }

    .content {
        display: flex;
        visibility: hidden;
        margin: 0 auto;
        padding: 10px;
        box-sizing: border-box;
        text-align: center;
        width: 90vw;
        z-index: var(--front);
        background-color: var(--theme_color_2);
        border: 1px solid var(--theme_color_2);
        cursor: default;
        transition-property: visibility;
        transition-duration: var(--timing_fast);
        transition-timing-function: linear;
        transition-delay: var(--timing_fastest);
        max-width: 400px;
        min-width: 300px;
        height: 260px;
        max-height: 260px;
        position: fixed;
        top: 150px;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .modal-background.show .content {
        visibility: visible;
    }
    .dismiss {
        cursor: pointer;
        padding: 0px;
        background-color: var(--theme_color_10);
        color: white;
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: var(--front);
    }
</style>

<div class="modal-background" class:show bind:this={modal}>
    <div class="content" bind:this={modal}>
        <button class="dismiss" on:click={dispatchDismissModal}>x</button>
        <slot />
    </div>
</div>
