<script>
    import { createEventDispatcher } from 'svelte'
    import Config from './Config.js'
    import Modal from './Modal.svelte'
    import ItemCrudForm from './ItemCrudForm.svelte'
    export let show = false
    export let itemType = ''
    export let itemChildren = []
    export let formType = ''
    export let item = null
    export let actionComplete = false
    let dismissModalProps = Object.assign({}, Config.itemCrudModalDefaultProps)

    const dispatch = createEventDispatcher()
    // reset modal on submit
    function submitCallback() {
        dispatch('displayCrudModal', {
            modalProps: dismissModalProps
        })
    }
</script>

<style>

</style>

<Modal on:displayCrudModal {show}>
    <ItemCrudForm
        {itemType}
        {formType}
        {item}
        {itemChildren}
        {submitCallback}
        {actionComplete}
        on:displayCrudModal
        on:displayAlert />
</Modal>
