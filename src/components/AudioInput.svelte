<script>
    import { onMount, onDestroy, createEventDispatcher } from 'svelte'
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
    let AudioSession = { ctx: null, stream: null }
    let audioSource = ''
    let isStreaming = false
    let shouldStop = false
    let stopped = false

    function audioInput(event) {
        console.dir(event)
        let files = event.detail.value
        let file = files[0]
        const url = URL.createObjectURL(file)
        // Do something with the audio file.
        audioSource = url
    }

    async function getUserAudioStream() {
        return await window.navigator.mediaDevices.getUserMedia({
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

    function toggleAudioStream(e) {
        isStreaming = !isStreaming
        if (isStreaming) {
            AudioSession.ctx = AudioSession.ctx || newAudioContext()
        }
    }

    async function streamUserAudio(start) {
        if (!start) {
            console.info(`stopping stream`)
            return
        }
        console.info(`streamUserAudio() called:`)
        let stream = null

        try {
            stream = await getUserAudioStream()
            console.info(`stream generated:`)
            console.dir(stream)
            /* use the stream */
            AudioSession.stream = stream
            // document.querySelector('#player').srcObject = stream
        } catch (err) {
            /* handle the error */
            console.error(err)
        }
    }

    // onMount(getUserAudioPermissions)

    onDestroy(async () => {
        await AudioSession.ctx.close()
        // delete Audio.context to prevent memory leak
        delete AudioSession.ctx
    })

    $: streamUserAudio(isStreaming)
</script>

<style>
    section {
        /* padding: 10px;
        margin: 10px; */
    }

    button {
        margin: 10px 0;
    }
</style>

<section class="audio-input">
    <!-- <audio id="player" src={audioSource} srcObject={audioSource} controls /> -->
    <!-- <Field {...audioInputField} on:inputValueChange={audioInput} /> -->
    <button on:click={toggleAudioStream}>&#127908;</button>
</section>
{#if isStreaming && AudioSession.ctx && AudioSession.stream}
    <AudioVisualizer {AudioSession} />
    <AudioPitchDetector {AudioSession} />
{/if}
