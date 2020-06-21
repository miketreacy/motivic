<script>
    import { onMount, createEventDispatcher } from 'svelte'
    import Field from './Field.svelte'
    import MotifForm from './MotifForm.svelte'
    import MotivicUtils from '../MotivicUtils'

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
    const audioInputField = {
        type: 'file',
        id: 'audio',
        label: 'Upload WAV file or sing or play into microphone',
        accept: 'audio/*',
        wrap: false,
        centerLabel: true,
        audioCapture: true
    }

    let audioSource = ''
    let shouldStop = false
    let stopped = false

    const recordedChunks = []

    let mediaRecorder = null
    let clipName = ''
    let clipSource = ''
    let audioCtx
    let canvasCtx
    let chunks = []
    let record
    let stop
    let soundClips
    let canvas
    let mainSection
    let analyser

    let detectedPitch = ''
    let pitchConfidence = 'vague'
    let pitchCentsOff = 0
    let pitchAccuracy = ''

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
            document.querySelector('#player').srcObject = stream
            mediaRecorder = getMediaRecorder(
                stream,
                document.querySelector('#download')
            )
            mediaRecorder.start()
            processAudio(stream)
        } catch (err) {
            /* handle the error */
            console.error(err)
        }
    }

    function stopStream() {
        shouldStop = true
        mediaRecorder.stop()
    }

    function visualize(stream) {
        if (!audioCtx) {
            audioCtx = new AudioContext()
        }

        const source = audioCtx.createMediaStreamSource(stream)
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 2048
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        source.connect(analyser)
        //analyser.connect(audioCtx.destination);

        draw()

        function draw() {
            const WIDTH = canvas.width
            const HEIGHT = canvas.height

            requestAnimationFrame(draw)

            analyser.getByteTimeDomainData(dataArray)

            canvasCtx.fillStyle = 'rgb(200, 200, 200)'
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

            canvasCtx.lineWidth = 2
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)'

            canvasCtx.beginPath()

            let sliceWidth = (WIDTH * 1.0) / bufferLength
            let x = 0

            for (let i = 0; i < bufferLength; i++) {
                let v = dataArray[i] / 128.0
                let y = (v * HEIGHT) / 2

                if (i === 0) {
                    canvasCtx.moveTo(x, y)
                } else {
                    canvasCtx.lineTo(x, y)
                }

                x += sliceWidth
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2)
            canvasCtx.stroke()
        }
    }

    function startClipRecording(e) {
        let record = e.target
        mediaRecorder.start()
        console.log(mediaRecorder.state)
        console.log('recorder started')
        record.style.background = 'red'
        stop.disabled = false
        record.disabled = true
    }

    function stopClipRecording() {
        mediaRecorder.stop()
        console.log(mediaRecorder.state)
        console.log('recorder stopped')
        record.style.background = ''
        record.style.color = ''
        // mediaRecorder.requestData();

        stop.disabled = true
        record.disabled = false
    }

    function clipLabelClick(e) {
        const existingName = e.target.textContent
        const newClipName = prompt('Enter a new name for your sound clip?')
        if (newClipName === null) {
            clipName = existingName
        } else {
            clipName = newClipName
        }
    }

    function clipDeleteBtnClick(e) {
        clipName = ''
    }

    function mediaRecorderOnDataAvailable(e) {
        chunks.push(e.data)
    }

    function mediaRecorderOnStop(e) {
        console.log('data available after MediaRecorder.stop() called.')

        clipName = prompt(
            'Enter a name for your sound clip?',
            'My unnamed clip'
        )

        audio.controls = true
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' })
        chunks = []
        const audioURL = window.URL.createObjectURL(blob)
        clipSource = audioURL
        console.log('recorder stopped')
    }

    function onMediaSuccess(stream) {
        gotStream(stream)
        mediaRecorder = new MediaRecorder(stream)
        visualize(stream)
    }

    function onMediaError(err) {
        console.log('The following error occured: ' + err)
    }

    function initClipRecorder() {
        window.navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(onMediaSuccess, onMediaError)
    }

    var MIN_SAMPLES = 0 // will be initialized when AudioContext is created.
    var GOOD_ENOUGH_CORRELATION = 0.9 // this is the "bar" for how close a correlation needs to be
    var rafID = null
    var tracks = null
    var buflen = 1024
    var buf = new Float32Array(buflen)

    var noteStrings = [
        'C',
        'C#',
        'D',
        'D#',
        'E',
        'F',
        'F#',
        'G',
        'G#',
        'A',
        'A#',
        'B'
    ]

    function noteFromPitch(frequency) {
        var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2))
        return Math.round(noteNum) + 69
    }

    function frequencyFromNoteNumber(note) {
        return 440 * Math.pow(2, (note - 69) / 12)
    }

    function centsOffFromPitch(frequency, note) {
        return Math.floor(
            (1200 * Math.log(frequency / frequencyFromNoteNumber(note))) /
                Math.log(2)
        )
    }

    function autoCorrelate(buf, sampleRate) {
        var SIZE = buf.length
        var MAX_SAMPLES = Math.floor(SIZE / 2)
        var best_offset = -1
        var best_correlation = 0
        var rms = 0
        var foundGoodCorrelation = false
        var correlations = new Array(MAX_SAMPLES)

        for (var i = 0; i < SIZE; i++) {
            var val = buf[i]
            rms += val * val
        }
        rms = Math.sqrt(rms / SIZE)
        if (rms < 0.01)
            // not enough signal
            return -1

        var lastCorrelation = 1
        for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
            var correlation = 0

            for (var i = 0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs(buf[i] - buf[i + offset])
            }
            correlation = 1 - correlation / MAX_SAMPLES
            correlations[offset] = correlation // store it, for the tweaking we need to do below.
            if (
                correlation > GOOD_ENOUGH_CORRELATION &&
                correlation > lastCorrelation
            ) {
                foundGoodCorrelation = true
                if (correlation > best_correlation) {
                    best_correlation = correlation
                    best_offset = offset
                }
            } else if (foundGoodCorrelation) {
                // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
                // Now we need to tweak the offset - by interpolating between the values to the left and right of the
                // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
                // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
                // (anti-aliased) offset.

                // we know best_offset >=1,
                // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
                // we can't drop into this clause until the following pass (else if).
                var shift =
                    (correlations[best_offset + 1] -
                        correlations[best_offset - 1]) /
                    correlations[best_offset]
                return sampleRate / (best_offset + 8 * shift)
            }
            lastCorrelation = correlation
        }
        if (best_correlation > 0.01) {
            // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
            return sampleRate / best_offset
        }
        return -1
        //	var best_frequency = sampleRate/best_offset;
    }

    function updatePitch(time) {
        var cycles = new Array()
        analyser.getFloatTimeDomainData(buf)
        var ac = autoCorrelate(buf, audioCtx.sampleRate)

        if (ac == -1) {
            pitchConfidence = `vague`
        } else {
            pitchConfidence = `confident`

            let pitch = ac
            var note = noteFromPitch(pitch)
            let pitchName = noteStrings[note % 12]
            detectedPitch = pitchName
            console.info(`pitchName: ${pitchName}`)
            let detune = centsOffFromPitch(pitch, note)
            pitchCentsOff = detune
            console.info(`cents off pitch: ${detune}`)
            if (detune == 0) {
                console.info(`pitch is perfect`)
                pitchAccuracy = 'perfect'
            } else {
                if (detune < 0) pitchAccuracy = 'flat'
                else pitchAccuracy = 'sharp'
                let detuneAmount = Math.abs(detune)
                console.log(`detuneAmount = ${detuneAmount}`)
            }
        }
        rafID = window.requestAnimationFrame(updatePitch)
        // TODO:
    }

    function gotStream(stream) {
        if (!audioCtx) {
            audioCtx = new AudioContext()
        }
        // Create an AudioNode from the stream.
        let mediaStreamSource = audioCtx.createMediaStreamSource(stream)

        // Connect it to the destination.
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 2048
        mediaStreamSource.connect(analyser)
        updatePitch()
    }

    function stopPitchDetection() {
        window.cancelAnimationFrame(rafID)
    }

    // onMount(getUserAudioPermissions)

    onMount(() => {
        record = document.querySelector('.record')
        stop = document.querySelector('.stop')
        soundClips = document.querySelector('.sound-clips')
        canvas = document.querySelector('.visualizer')
        mainSection = document.querySelector('.main-controls')
        canvasCtx = canvas.getContext('2d')
        window.onresize = function() {
            canvas.width = mainSection.offsetWidth
        }

        window.onresize()
        initClipRecorder()
    })
</script>

<style>
    a {
        display: flex;
        flex-direction: column;
        cursor: pointer;
        color: var(--theme_color_2);
        font-size: var(--theme_font_size_2);
        background-color: var(--theme_color_1);
        border: none;
        border-radius: 5px;
        min-height: 30px;
        outline: none;
        padding: 5px;
        height: var(--touch_min_height);
        box-sizing: border-box;
        width: 40px;
        margin: 0 10px;
    }
    section {
        padding: 10px;
        margin: 10px;
    }
    #buttons {
        margin: 10px;
    }
    #buttons button {
        background-color: white;
        margin: 0 10px;
        font-size: var(--theme_font_size_4);
    }
    .pitch-detection {
        display: flex;
        flex-direction: column;
    }
    output {
        border: 1px dashed;
        width: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: 0;
        padding: 10px;
    }
    pre {
        margin: 0;
        display: flex;
    }
    #pitch {
        font-size: var(--theme_font_size_5);
        justify-content: center;
    }
</style>

<section class="main-controls">
    <canvas class="visualizer" height="200px" />
    <div id="buttons">
        <button class="record" on:click={startClipRecording}>&#9210;</button>
        <button class="stop" on:click={stopClipRecording}>&#9209;</button>
    </div>
    <div class="pitch-detection">
        <output>
            <pre id="pitch">{detectedPitch}</pre>
            <pre>confidence: {pitchConfidence}</pre>
            <pre>{pitchAccuracy} by {pitchCentsOff} cents</pre>
        </output>
        <button on:click={stopPitchDetection}>cancel pitch detection</button>
    </div>
</section>

<section class="sound-clips">
    {#if clipSource}
        <article class="clip">
            <audio controls="true" src={clipSource} />
            <div class="clip-label" on:click={clipLabelClick}>{clipName}</div>
            <button class="delete" on:click={clipDeleteBtnClick}>
                delete clip
            </button>
        </article>
    {/if}
</section>

<!-- <div class="audio-input-controls controls">
    <Field {...audioInputField} on:inputValueChange={audioInput} />
    <audio id="player" src={audioSource} srcObject={audioSource} controls />
    <div class="audio-input controls">
        <button on:click={toggleAudioRecord}>&#127908;&#9210;</button>

        <a id="download">&#8681;</a>
        {#if mediaRecorder}
            <div>{mediaRecorder.state}</div>
            <button id="stop" on:click={stopStream}>&#9209;</button>
        {/if}
    </div>
</div> -->
