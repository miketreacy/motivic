<script>
    import { createEventDispatcher } from 'svelte'
    import Utils from './Utils'
    export let item = null
    export let type = ''
    export let submitCallback = Function.prototype
    export let actionComplete = false
    let responseMsg = ''
    function deleteItem() {
        let [success, msg] = Utils.userData.remove(item, type, false)
        responseMsg = msg
        actionComplete = true
        const interval = setTimeout(submitCallback, 3000)
    }

    const dispatch = createEventDispatcher()
    function dispatchDismissModal() {
        dispatch('displayModal', {
            display: false
        })
    }
</script>

<style>

</style>

<div>
    <h3>Delete {Utils.general.singularize(type)}</h3>
    <fieldset id="delete-motif">
        <div class="input-wrap name">
            Do you really want to delete {item.name} ID: {item.id}?
        </div>
        <button class="submit" on:click={deleteItem}>delete</button>
    </fieldset>
    {#if actionComplete}{responseMsg}{/if}
</div>
