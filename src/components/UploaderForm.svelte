<script>
    import { onMount, createEventDispatcher } from 'svelte'
    import Field from './Field.svelte'
    import MotifForm from './MotifForm.svelte'
    import MotivicUtils from '../MotivicUtils'
    export let formOpen = false
    const formId = 'uploader'
    const formTitle = 'Uploader'
    const formInfo = 'upload a monophonic melody from a MIDI or JSON file.'
    let topControls = false
    let newMotif = null
    const dispatch = createEventDispatcher()
    let staticProps = {
        formId,
        formTitle,
        formInfo,
        topControls,
        formControls: []
    }
    const fileUploadField = {
        type: 'file',
        id: 'upload',
        label: 'Upload file (MIDI or JSON)',
        accept: '.json, .midi, .mid',
        wrap: false,
        centerLabel: true
    }

    function handleUploadedMotifs(results) {
        results.forEach(result => {
            let [success, msg, uploadedMotif] = result
            dispatch('displayAlert', {
                visible: true,
                type: success ? 'success' : 'error',
                message: msg,
                displayTimeMs: 1500,
                dismissable: false
            })
            newMotif = uploadedMotif
        })
    }

    function uploadFile(event) {
        console.log(`uploadFile() called`)
        console.dir(event.detail)
        let files = event.detail.value
        let file = files[0]
        let reader = new FileReader()
        let dotIndex = file.name.lastIndexOf('.')
        let fileName = file.name.substring(0, dotIndex)
        let fileType = file.name.substring(dotIndex + 1)
        if (fileType === 'json') {
            reader.addEventListener(
                'load',
                MotivicUtils.file.json.uploadHandler(
                    fileName,
                    handleUploadedMotifs
                )
            )
            reader.readAsText(file)
        } else if (fileType === 'midi' || fileType === 'mid') {
            reader.addEventListener(
                'load',
                MotivicUtils.file.midi.uploadHandler(
                    fileName,
                    handleUploadedMotifs
                )
            )
            reader.readAsDataURL(file)
        }
    }
</script>

<style>
    .controls {
        padding-top: 20px;
    }
</style>

<MotifForm
    {...staticProps}
    {formOpen}
    {newMotif}
    on:displayToggle
    on:displayCrudModal
    on:displayAlert>
    <div class="upload-controls controls">
        <Field {...fileUploadField} on:inputValueChange={uploadFile} />
    </div>
</MotifForm>
