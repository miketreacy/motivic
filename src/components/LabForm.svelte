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
    import Lab from './Lab.svelte'
    export let formOpen = false
    export let motifs = []

    const formId = 'lab'
    const formTitle = 'Lab'
    const formInfo = 'combine and arrange motifs in the polyphonic lab.'
    const topControls = false
    const dispatch = createEventDispatcher()
    let staticProps = {
        formId,
        formTitle,
        formInfo,
        topControls,
        formControls: [],
    }
    export let newMotif = null
</script>

<MotifForm
    {...staticProps}
    {formOpen}
    {newMotif}
    on:displayToggle
    on:displayCrudModal
    on:displayAlert
>
    {#if formOpen}
        <Lab
            open={formOpen}
            {motifs}
            on:displayToggle
            on:displayAlert
            on:displayCrudModal
        />
    {/if}
</MotifForm>

<style>
</style>
