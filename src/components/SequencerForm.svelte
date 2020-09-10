<script>
    import { onMount, createEventDispatcher } from 'svelte'
    import Config from '../Config'
    import Nexus from 'nexusui'
    // can't import it this way because of a nested dependency export/import issue
    // import Tone from 'tone'
    import DropDown from './DropDown.svelte'
    import CrudControls from './CrudControls.svelte'
    import MotivicUtils from '../MotivicUtils'
    import MotifForm from './MotifForm.svelte'
    import Sequencer from './Sequencer.svelte'
    export let formOpen = false
    export let motifs = []

    const formId = 'sequencer'
    const formTitle = 'Sequencer'
    const formInfo = 'create a new motif on the sequencer grid.'
    const topControls = false
    const dispatch = createEventDispatcher()
    let staticProps = {
        formId,
        formTitle,
        formInfo,
        topControls,
        formControls: []
    }
    export let newMotif = null
</script>

<style>

</style>

<MotifForm
    {...staticProps}
    {formOpen}
    {newMotif}
    on:displayToggle
    on:displayCrudModal
    on:displayAlert>
    {#if formOpen}
        <Sequencer
            open={formOpen}
            motifs={newMotif ? [newMotif] : []}
            on:displayToggle
            on:displayAlert
            on:displayCrudModal />
    {/if}
</MotifForm>
