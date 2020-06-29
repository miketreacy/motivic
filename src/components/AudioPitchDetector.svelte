<script>
    import { onMount } from 'svelte'
    export let AudioSession = { ctx: null, stream: null }

    let rafID = null
    let analyser = null

    let detectedPitch = ''
    let pitchConfidence = 'vague'
    let pitchCentsOff = 0
    let pitchAccuracy = ''

    var MIN_SAMPLES = 0 // will be initialized when AudioContext is created.
    var GOOD_ENOUGH_CORRELATION = 0.9 // this is the "bar" for how close a correlation needs to be

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

    function stopLoop() {
        window.cancelAnimationFrame(rafID)
    }

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

    function handleStream(stream) {
        // Create an AudioNode from the stream.
        let mediaStreamSource = AudioSession.ctx.createMediaStreamSource(stream)

        // Connect it to the destination.
        // TODO: pass analyser node in? from Audio lib?
        analyser = AudioSession.ctx.createAnalyser()
        analyser.fftSize = 2048
        mediaStreamSource.connect(analyser)
        detectPitch()
    }

    function detectPitch() {
        var cycles = new Array()

        analyser.getFloatTimeDomainData(buf)
        var ac = autoCorrelate(buf, AudioSession.ctx.sampleRate)
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
        rafID = window.requestAnimationFrame(detectPitch)
        // TODO:
    }
    onMount(() => {
        if (AudioSession.ctx && AudioSession.stream) {
            handleStream(AudioSession.stream)
        }
        return stopLoop
    })

    $: handleStream(AudioSession.stream)
</script>

<style>
    section {
        padding: 10px;
        margin: 5px;
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

<section class="pitch-detection">
    <output>
        <pre id="pitch">{detectedPitch}</pre>
        <pre>confidence: {pitchConfidence}</pre>
        <pre>{pitchAccuracy} by {pitchCentsOff} cents</pre>
    </output>
    <!-- <button on:click={stopLoop}>stop pitch detection</button> -->
</section>
