<script>
    import { onMount, createEventDispatcher } from 'svelte'
    import { newAudioContext } from '../Audio.js'
    import Field from './Field.svelte'
    import MotivicUtils from '../MotivicUtils'
    import AudioVisualizer from './AudioVisualizer.svelte'
    import AudioRecorder from './AudioRecorder.svelte'
    import AudioPitchDetector from './AudioPitchDetector.svelte'

    const dispatch = createEventDispatcher()
    const audioInputField = {
        type: 'file',
        id: 'audio',
        label: 'Upload WAV file or sing or play into microphone',
        accept: 'audio/*',
        wrap: false,
        centerLabel: true,
        audioCapture: true
    }
    let audioCtx = null
    let audioStream = null
    let audioSource = ''
    let shouldStop = false
    let stopped = false

    const recordedChunks = []

    let mediaRecorder = null

    function audioInput(event) {
        console.dir(event)
        let files = event.detail.value
        let file = files[0]
        const url = URL.createObjectURL(file)
        // Do something with the audio file.
        audioSource = url
    }

    const handleAudioStream = function(stream) {
        console.dir(stream)
        audioSource = stream
    }

    function getUserAudioStream() {
        return window.navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        })
    }

    function handleUserAudioPermissions(result) {
        let msg = ''
        if (result.state == 'granted') {
            msg = `You have granted`
        } else if (result.state == 'prompt') {
            msg = `You will be prompted to grant`
        } else if (result.state == 'denied') {
            msg = `You have denied`
        }
        window.alert(
            `${msg} Motivic permission to use your microphone audio input`
        )
        result.onchange = handleUserAudioPermissions
    }

    function getUserAudioPermissions(permissionsChangeCallbackFn) {
        window.navigator.permissions
            .query({ name: 'microphone' })
            .then(handleUserAudioPermissions)
    }

    function toggleAudioRecord(e) {
        // getUserAudioStream().then(handleAudioStream)
        streamUserAudio()
    }

    function getMediaRecorder(stream, downloadLink) {
        console.info(`getMediaRecorder() called with stream:`)
        console.dir(stream)
        const options = { mimeType: 'audio/webm' }
        const mediaRecorder = new window.MediaRecorder(stream, options)

        mediaRecorder.addEventListener('dataavailable', e => {
            console.info(`dataavailable called on mediaRecorder`)
            if (e.data.size > 0) {
                recordedChunks.push(e.data)
            }

            if (shouldStop === true && stopped === false) {
                mediaRecorder.stop()
                stopped = true
            }
        })

        mediaRecorder.addEventListener('stop', () => {
            console.info(`stop called on mediaRecorder`)
            downloadLink.href = URL.createObjectURL(new Blob(recordedChunks))
            downloadLink.download = 'mictest.wav'
        })

        return mediaRecorder
    }

    function processAudio(stream) {
        console.info(`processAudio() called with stream:`)
        console.dir(stream)
        const context = new AudioContext()
        const source = context.createMediaStreamSource(stream)
        const processor = context.createScriptProcessor(1024, 1, 1)

        source.connect(processor)
        processor.connect(context.destination)

        processor.onaudioprocess = e => {
            // Do something with the data, e.g. convert it to WAV
            // console.log(e.inputBuffer)
        }
    }

    async function streamUserAudio() {
        console.info(`streamUserAudio() called:`)
        let stream = null

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            })
            console.info(`stream generated:`)
            console.dir(stream)
            /* use the stream */
            audioStream = stream
            // document.querySelector('#player').srcObject = stream
        } catch (err) {
            /* handle the error */
            console.error(err)
        }
    }

    function stopStream() {
        shouldStop = true
        mediaRecorder.stop()
    }

    // onMount(getUserAudioPermissions)

    onMount(() => {
        audioCtx = newAudioContext()
    })
</script>

<style>
    section {
        padding: 10px;
        margin: 10px;
    }
</style>

<section class="audio-input">
    <audio id="player" src={audioSource} srcObject={audioSource} controls />
    <Field {...audioInputField} on:inputValueChange={audioInput} />
    <button on:click={toggleAudioRecord}>&#127908;&#9210;</button>
</section>

<AudioVisualizer {audioCtx} {audioStream} />
