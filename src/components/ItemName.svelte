<script>
    import { createEventDispatcher } from 'svelte'
    import MotivicUtils from '../MotivicUtils'
    export let item = null
    export let itemType = ''
    const dispatch = createEventDispatcher()

    function dispatchDisplayModal(event) {
        dispatch('displayCrudModal', {
            modalProps: {
                show: true,
                itemType,
                item: item,
                formType: 'rename',
                actionComplete: false
            }
        })
    }
</script>

<style>
    .name-wrap {
        width: 100%;
        position: relative;
        justify-content: left;
        align-self: flex-start;
    }
    .name {
        cursor: text;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: var(--theme_font_size_2);
        text-align: left;
        align-self: flex-start;
        flex: 1 1 0;
        cursor: pointer;
    }

    button {
        max-width: 40%;
        font-size: var(--theme_font_size_1);
    }

    .rename {
        justify-self: center;
        font-size: var(--theme_font_size_3);
    }
</style>

<div class="name-wrap" on:click>
    <h3 class="name" data-item-id={item.id} on:click>{item.name}</h3>
    <button class="rename" on:click|self={dispatchDisplayModal}>&#9998;</button>
</div>
