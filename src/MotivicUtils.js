import Midi from 'jsmidgen'
import MIDIParser from 'midi-parser-js'
import { createEventDispatcher } from 'svelte'
import Config from './Config.js'
import { motifStore, settingStore } from './stores/Item'

let win = window
let doc = document
const MotivicUtils = {
    general: {
        clone: function (val) {
            return JSON.parse(JSON.stringify(val))
        },

        /**
         * Takes an array of primitive values and makes them unique.
         * @param {Array} arr An array
         * @returns {Array} unique array
         */
        unique: function (arr) {
            return [...new Set([...arr])]
        },

        /**
         * Generates a numberical range of ints
         * @param {number} size Length of range array to return
         * @param {number} startAt Number to start range
         * @param {number} step Distance between range members
         * @returns {Array} Range
         */
        range: function (size, startAt = 0, step = 1) {
            return [...Array(size).keys()].map((i) => i * step + startAt)
        },

        /**
         * Generates and returns a random alphanumeric string. Will return only alpha or numeric
         * characters if optional type argument is passed.
         * @param {number} length The length of the random string we wish to generate.
         * @param {string} [type] Optional type of string (alpha or num).
         * @returns {string} A random alphanumeric string.
         */
        randomString: function (length, type = 'alphaNum') {
            let alpha = 'abcdefghijklmnopqrstuvwxyz'
            let num = '0123456789'
            let charMap = {
                alpha: alpha.toUpperCase() + alpha,
                num: num,
                alphaNum: num + alpha + num + alpha.toUpperCase() + num,
            }
            let text = ''

            for (let i = 0; i < length; i++) {
                let map = charMap[type]
                text += map.charAt(Math.floor(Math.random() * map.length))
            }
            return text
        },

        /**
         * Left pad for strings
         * @param {string} str string to pad
         * @param {number} totalCharSpace total amount of spaces to fill
         * @returns {string} padded string
         */
        leftPad: function (str, totalCharSpace) {
            let prefix = ''
            let result = str
            let gap = totalCharSpace - str.length
            if (gap > 0) {
                prefix = Array(gap).fill(' ').join('')
            }
            return `${prefix}${result}`
        },

        /**
         * simple util for getting a singular string from plural string
         * @param {string} str String to singularize
         * @returns {string} Singularized string
         */
        singularize: function (str) {
            let split = str.split('')
            return split.filter((char, i, arr) => i < arr.length - 1).join('')
        },
        /**
         * An immutable wrapper around Array.prototype.sort() that doesn't mutate the original array.
         * @param {*} arr
         */
        immutableSort: function (arr) {
            return arr.concat().sort()
        },
        /**
         * Sorts objects alphabetically by a string property
         * @param {*} key
         * @param {*} sortOrder
         * @returns {Function} compareFunction to be passed to Array.prototype.sort()
         */
        objectKeySorterAlpha: function (key, sortOrder = 'asc') {
            const alphaSortMap = {
                asc: (a, b) => {
                    let aVal = a[key].toLowerCase()
                    let bVal = b[key].toLowerCase()
                    if (aVal < bVal) {
                        return -1
                    }
                    if (aVal > bVal) {
                        return 1
                    }
                    return 0
                },
                desc: (a, b) => {
                    let aVal = a[key].toLowerCase()
                    let bVal = b[key].toLowerCase()
                    if (aVal > bVal) {
                        return -1
                    }
                    if (aVal < bVal) {
                        return 1
                    }
                    return 0
                },
            }
            return alphaSortMap[sortOrder]
        },
        /**
         * Sorts objects numerically by a numerical property (or a property that can be converted to a numerical value)
         * @param {*} key
         * @param {*} sortOrder
         * @param {*} convertorFn
         * @returns {Function} compareFunction to be passed to Array.prototype.sort()
         */
        objectKeySorterNum: function (
            key,
            sortOrder = 'asc',
            convertorFn = (x) => x
        ) {
            const alphaSortMap = {
                asc: (a, b) => {
                    return convertorFn(a[key]) - convertorFn(b[key])
                },
                desc: (a, b) => {
                    return convertorFn(b[key]) - convertorFn(a[key])
                },
            }
            return alphaSortMap[sortOrder]
        },
        /**
         * Formats a Date as 'yyyy-mm-dd hh:mm:ss' without changing timezone
         * @param {Date} date
         * @param {boolean} displayTime
         * @returns {string} formatted date string
         */
        dateDisplay: function (date, displayTime = true) {
            const pad = (n) => (n < 10 ? '0' + n.toString() : n.toString())
            let days = pad(date.getDate())
            let mons = pad(date.getMonth() + 1)
            let year = date.getFullYear()
            let dateStr = `${year}-${mons}-${days}`

            if (!displayTime) {
                return dateStr
            }
            let hrs = pad(date.getHours())
            let mins = pad(date.getMinutes())
            let secs = pad(date.getSeconds())
            let timeStr = `${hrs}:${mins}:${secs}`
            return `${dateStr} ${timeStr}`
        },
        /**
         * Limits the amount of times an event callback can be fired.
         * Good for attenuating the frequency of rapid i/o events (window.scroll, window.resize, data.stream).
         * @param {*} timeout An undefined variable to store a function in.
         * @param {function} cb A callback function to execute.
         * @param {number} interval  The number of milliseconds to wait before the callback can be fired again.
         * @param {Array} cbArgs Array of arguments to be applied to the callback function.
         */
        throttle: function (timeout, cb, interval, cbArgs) {
            // ignore events as long as a callback execution is in the queue
            cbArgs = cbArgs && cbArgs.length ? [...cbArgs] : null
            if (!timeout) {
                timeout = setTimeout(() => {
                    timeout = null
                    if (typeof cb === 'function') {
                        cb.apply(this, cbArgs)
                    }
                }, interval)
            }
        },

        /**
         * A higher-order timeout wrapper for promises, such as window.fetch()
         * @param {number} ms Milliseconds to wait before rejecting promise
         */
        timeout: function (ms) {
            /**
             * @param {Promise} promise Promise to wrap
             */
            return function (promise) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject(new Error(`fetch timed out after ${ms} ms`))
                    }, ms)
                    promise.then(resolve, reject)
                })
            }
        },
    },
    http: {
        /**
         * Async fetch wrapper
         * @param {string} url URL to request
         * @param {Object} params fetch params object
         * @returns {Array} Tuple of [data, error]
         */
        awaitFetch: async function (
            url,
            params,
            wrapper = Function.prototype,
            file = false
        ) {
            let data = null
            let error = null

            try {
                let res = await wrapper(win.fetch(url, params))

                if (res.ok) {
                    console.dir(res)

                    try {
                        if (file) {
                            data = await res.blob()
                        } else {
                            data = await res.json()
                        }
                    } catch (e) {
                        let text = await res.text()
                        console.info(`Text response: ${text}`)
                        data = { text }
                    }
                } else {
                    let errMsg = await res.text()
                    throw new Error(errMsg)
                }
            } catch (e) {
                console.error(e)
                error = e
            }
            return [data, error]
        },
        /**
         * Async fetch wrapper with request timeout
         * @param {string} url URL to request
         * @param {Object} params fetch params object
         * @param {number} ms Milliseconds to wait before timing out
         */
        awaitFetchTimeout: async function (url, params, ms, file = false) {
            return this.awaitFetch(
                url,
                params,
                MotivicUtils.general.timeout(ms),
                file
            )
        },
    },
    melody: {
        getVoice: function () {
            return [...doc.querySelectorAll('#voice option')].filter(
                (el) => el.selected
            )[0].dataset.voice
        },

        /**
         * Returns an ordered reference set of scientific pitches up to and including the given octave number.
         * @param {number} [lowOctave] Lowest octave to be included in set.
         * @param {number} highOctave Highest octave to be included in set.
         * @param {string} initialPitch First pitch in set.
         * @returns {Array} Ordered set of scientific pitches from low to high.
         */
        getPitchSet: function (
            lowOctave = Config.default.octave.low,
            highOctave = Config.default.octave.high,
            initialPitch = Config.default.note.pitch
        ) {
            let noteSet = Array.from(Config.notes)
            let seq = this.sequencePitches(noteSet, initialPitch)
            let set = []

            for (let i = lowOctave; i < highOctave + 1; i++) {
                seq.forEach((n, idx) => {
                    set.push({
                        name: n,
                        octave: i,
                        value: i * 12 + idx + 1,
                    })
                })
            }
            return set
        },

        getKeySet: function (key, mode, pitches) {
            let keySet = []
            Config.modes[mode].forEach((step) => {
                keySet.push(pitches[step].name)
            })
            return keySet
        },

        noteIsValid: function (noteName, set) {
            return set.includes(noteName) || noteName === 'rest'
        },

        // TODO: Allow for sharpening or flattening depending on location of nearest scale tone (currently just sharpens up to tone)
        // TODO: ~or~ Make it sharpen or flatten to scale depending on if new key is above or below existing key.
        /**
         * Transforms a given note value to fit a given scale.
         * @param {number} value Value to transform.
         * @param {Array} keySet Set of pitches in the desired scale.
         * @returns {number} Transformed pitch value.
         */
        transformNoteValue: function (value, keySet) {
            let newVal = value + 1
            let name = this.getNoteName(newVal)
            let result = newVal
            if (!this.noteIsValid(name, keySet)) {
                result = this.transformNoteValue(newVal, keySet)
            }
            return result
        },

        getNoteInterval: function (note, keySet) {
            return note.name === 'rest'
                ? null
                : keySet.findIndex((k) => k === note.name) + 1
        },

        getKeyFilteredValue: function (value, keySet) {
            let name = this.getNoteName(value)
            let result = value

            if (!this.noteIsValid(name, keySet)) {
                result = this.transformNoteValue(value, keySet)
            }
            return result
        },

        sequencePitches: function (pitches, pitch) {
            let tonicIndex = pitches.findIndex((p) => p === pitch)
            let set = pitches.splice(tonicIndex)
            set = set.concat(pitches)
            return set
        },

        /**
         * Filters through set of notes and returns the pitch of the first note that has a truthy pitch value.
         * @param {Array} melody Set of note maps.
         * @returns {string} Initial pitch of note set.
         */
        getInitialPitch: (melody) => melody.filter((n) => n.value)[0],

        // TODO: compute all auxillary properties based on the two crucial ones (value & duration)
        /**
         * Returns a new note object for a given value and duration.
         * @param {number} value Absolute value of note pitch.
         * @param {number} duration Duration of note in 64th beats.
         * @param {Object} melody Represents a melody, complete or during generation.
         * @param {string} melody.meta.key Key note of melody.
         * @param {string} melody.meta.mode Mode (aka scale) of melody by name.
         * @param {Array} melody.notes Array of objects representing melody notes.
         * @param {number} noteIdx Index of note within melody array.
         * @returns {Object} New note instance.
         */
        getNote: function (
            value,
            duration,
            melody,
            noteIdx = melody.notes.length - 1
        ) {
            let key = melody.meta.key || this.getInitialPitch(melody.notes)
            let mode = melody.meta.mode || 'chromatic'
            let pitchSet = this.getPitchSet(0, 0, key)
            let keySet = this.getKeySet(key, mode, pitchSet)
            let isRest = value === null
            let thisValue = ((v) => {
                let val = v
                if (!isRest) {
                    val = val < 0 ? (val % 12) + 12 : val
                    val = this.getKeyFilteredValue(val, keySet)
                }
                return val
            })(value)
            let name = isRest ? 'rest' : this.getNoteName(thisValue)
            let octave = isRest ? null : this.getNoteOctave(thisValue)
            let pitch = name + (typeof octave === 'number' ? octave : '')
            let initialPitch = this.getInitialPitch(melody.notes)
            let steps = isRest
                ? null
                : thisValue - (initialPitch ? initialPitch.value : thisValue)
            let interval = this.getNoteInterval(
                {
                    name,
                },
                keySet
            )
            let startingBeat =
                melody.notes
                    .slice(0, noteIdx)
                    .reduce((total, note) => total + note.duration, 0) + 1
            return {
                value: thisValue,
                name,
                octave,
                pitch,
                duration,
                steps,
                startingBeat,
                interval,
            }
        },

        getNoteName: function (value = Config.default.note.value) {
            let noteModulo = value % 12
            let noteIndex = noteModulo ? noteModulo - 1 : 11
            let octavePitches = this.getPitchSet(0, 0)
            return octavePitches[noteIndex].name
        },

        getNoteOctave: function (value = Config.default.note.value) {
            let noteModulo = value % 12
            return noteModulo
                ? Math.floor(value / 12)
                : Math.floor(value / 12) - 1
        },

        getNoteValue: function (
            name = Config.default.note.pitch,
            octave = Config.default.note.octave
        ) {
            let octavePitches = this.getPitchSet(octave, octave)
            let match = octavePitches.filter(
                (p) => p.name === name.toLowerCase()
            )
            return match[0].value
        },
    },
    file: {
        midi: {
            getBPM: function (microSecondsPerQuarterNote) {
                let microSecondsPerMinute = 60000000
                return Math.round(
                    microSecondsPerMinute / microSecondsPerQuarterNote
                )
            },

            getTimeSignature: function (data) {
                let [beats, exponent] = data
                let units = Math.pow(2, exponent)
                console.info(`MIDI time signature event data`)
                console.dir(data)
                console.info(`MIDI time signature parsed as ${beats}/${units}`)
                return [beats, units]
            },

            getKeySignature: function (data) {
                console.info(`MIDI key signature event data`)
                console.dir(data)
                let key = ''
                let mode = ''
                if (data && Array.isArray(data)) {
                    const keySigMap = {
                        sharps: ['c', 'g', 'd', 'a', 'e', 'b', 'f#', 'c#'],
                        flats: ['c', 'f', 'bb', 'eb', 'ab', 'db', 'gb', 'cb'],
                    }
                    let map = {
                        major: false,
                        minor: false,
                        sharps: 0,
                        flats: 0,
                    }
                    let [accidentals, scale] = data
                    scale = scale ? 'minor' : 'major'
                    map[scale] = true
                    let accidentalType = accidentals > 0 ? 'sharps' : 'flats'
                    let accidentalCount = Math.abs(accidentals)
                    map[accidentalType] = accidentalCount

                    key = keySigMap[accidentalType][accidentalCount]
                    mode = map.minor ? 'aolian' : 'ionian'
                }

                console.info(`MIDI key signature parsed as ${key}/${mode}`)
                return [key, mode]
            },

            getNextNoteOffEvent: function (arr, idx) {
                return arr.slice(idx + 1).find((e) => e.type === 8)
            },

            getTicks: function (noteDuration, timeSig) {
                return (
                    (noteDuration *
                        (Config.midiTicksPerQuarterNote * timeSig)) /
                    Config.rhythmicUnit
                )
            },

            parseFile: function (data, name) {
                let parsedFile = MIDIParser.Base64(data)
                // TODO: make a decision about polyphony here
                // either only parse the first MIDI track ~or~
                // create a polyphonice motif with one note set per MIDI track
                let motifs = parsedFile.track.map((t) => {
                    let motif = {
                        name: `${name}_midi-import`,
                        meta: {
                            key: '',
                            mode: 'chromatic',
                            // defaulting to 4/4 because sanity
                            timeSignature: [4, 4],
                            tempo: { type: 'bpm', units: 120 },
                            length: { type: 'measures', units: null },
                            octave: { min: null, max: null },
                        },
                        notes: [],
                    }

                    motif.notes = t.event.reduce((notes, event, idx, arr) => {
                        let note = null
                        let value
                        let duration
                        // parse meta events
                        if (event.type === 255) {
                            // tempo event
                            if (event.metaType === 81) {
                                motif.meta.tempo.units = this.getBPM(event.data)
                            }
                            // time signature event
                            if (event.metaType === 88) {
                                motif.meta.timeSignature = this.getTimeSignature(
                                    event.data
                                )
                            }
                            // key signature event
                            if (event.metaType === 89) {
                                ;[
                                    motif.meta.key,
                                    motif.meta.mode,
                                ] = this.getKeySignature(event.data)
                            }
                        }
                        // noteOn event
                        if (event.type === 9) {
                            if (event.deltaTime) {
                                // this accounts for any rests preceding the noteOn event
                                value = null
                                duration = event.deltaTime / 8
                                note = MotivicUtils.melody.getNote.bind(
                                    MotivicUtils.melody
                                )(value, duration, motif, idx)
                                notes.push(note)
                            }
                            // this is the note itself, getting duration from the next noteOff deltaTime
                            value = event.data[0] - 11
                            let nextNote = this.getNextNoteOffEvent(arr, idx)
                            duration = nextNote.deltaTime / 8

                            note = MotivicUtils.melody.getNote.bind(
                                MotivicUtils.melody
                            )(value, duration, motif, idx)
                            notes.push(note)
                        }
                        return notes
                    }, [])
                    return motif
                })
                return motifs
            },

            uploadHandler: function (fileName, callBack) {
                return function (e) {
                    let motifs = MotivicUtils.file.midi.parseFile.bind(
                        MotivicUtils.file.midi
                    )(e.target.result, fileName)
                    MotivicUtils.file.parseCallback(motifs, callBack)
                }
            },

            getMelody: function (melody) {
                let timeSig = melody.meta.timeSignature[0]
                let midiNotes = []
                let delayTicks = 0
                melody.notes.forEach((note) => {
                    if (note.value) {
                        midiNotes.push({
                            channel: 0,
                            duration: this.getTicks(note.duration, timeSig),
                            pitch: note.pitch,
                            time: delayTicks,
                        })
                        delayTicks = 0
                    } else {
                        delayTicks =
                            delayTicks + this.getTicks(note.duration, timeSig)
                    }
                })
                return midiNotes
            },

            addMetaEventsToTrack: function (track) {
                // track.events.push(new Midi.MetaEvent({
                //   type: MetaEvent.TEMPO,
                //   data: Util.mpqnFromBpm(bpm),
                //   time: time || 0,
                // }));
                // TODO: encode key, mode, and time signature following above example
                // reference the classes below:
                // Midi.MetaEvent.KEY_SIG
                // Midi.MetaEvent.TIME_SIG
                return track
            },

            getTrack: function (melody) {
                let track = new Midi.Track()
                let midiNotes = this.getMelody(melody)

                // TODO: set meta properties like tempo, time signature, and key
                track = this.addMetaEventsToTrack(track)
                track.setTempo(melody.meta.tempo.units)
                midiNotes.forEach((note) => {
                    track.addNote(
                        note.channel,
                        note.pitch,
                        note.duration,
                        note.time
                    )
                })

                return track
            },

            download: function (motifs = []) {
                let a = doc.createElement('a')
                let file = new Midi.File()

                motifs.forEach((m) => file.addTrack(this.getTrack(m)))
                let name = motifs[0].name
                MotivicUtils.file.processDownload('midi', name, file, false)
            },
        },

        json: {
            download: function (motifs = []) {
                let a = doc.createElement('a')
                let data = JSON.stringify(motifs, undefined, 4)
                let blob = new Blob([data], { type: 'text/json' })
                let name = motifs[0].name
                MotivicUtils.file.processDownload('json', name, blob, true)
            },

            uploadHandler: function (fileName, callBack) {
                return function (e) {
                    let str = e.target.result
                    let json = JSON.parse(str)
                    let motifs = json.map((m) => {
                        m.name = `${m.name || fileName}_json-import`
                        return m
                    })
                    MotivicUtils.file.parseCallback(motifs, callBack)
                }
            },
        },

        wav: {
            // WARNING: for multipart form uploads, LET THE BROWSER SET
            // 'Content-Type': 'multipart/form-data; boundary=???' for you,
            // OR IT WILL FAIL
            download: async function (motifs = [], voice = 'sine') {
                const apiConfig = {
                    url: '/api/convertor',
                    method: 'POST',
                    mode: 'cors',
                    headers: new Headers({
                        'Content-Type': 'application/json',
                    }),
                    timeoutMilliseconds: 20000,
                }
                function getApiParams(payload) {
                    let { method, mode, headers } = apiConfig
                    return {
                        method,
                        body: JSON.stringify(payload),
                        mode,
                        headers,
                    }
                }
                let motif = motifs[0]
                // 1. Make request to JSON => WAV convertor endpoint
                console.info('JSON payload...', motifs[0])
                console.info('making JSON => WAV call to convertor...')
                let [data, error] = await MotivicUtils.http.awaitFetchTimeout(
                    apiConfig.url,
                    getApiParams({ voice, motif }),
                    apiConfig.timeoutMilliseconds,
                    true
                )

                // 2. Handle converted zip file response
                if (data) {
                    console.log('API response from /api/convertor...')
                    console.dir(data)
                    console.info(`starting download via anchor href hack`)
                    MotivicUtils.file.processDownload(
                        'wav',
                        `${motif.name}_${voice}`,
                        data,
                        true,
                        true
                    )
                } else {
                    console.error(`API reponse error: ${error.message}`)
                    console.dir(error)
                }
            },
        },

        processDownload: function (
            fileType,
            name = '',
            data,
            blob = true,
            zip = false
        ) {
            const dispatch = createEventDispatcher()
            let downloadURL = ''
            let fileExt = zip ? 'zip' : fileType
            dispatch('downloadFile', { type: fileType, progress: 100 })
            if (blob) {
                downloadURL = window.URL.createObjectURL(data)
            } else {
                downloadURL =
                    `'data:audio/${fileType};base64,` + win.btoa(data.toBytes())
            }

            let a = doc.createElement('a')
            a.href = downloadURL
            a.target = '_blank'
            a.download = `${name}.${fileExt}`
            a.click()
            window.URL.revokeObjectURL(a.href)
            a.remove()
        },

        parseCallback: function (motifs, callBack = Function.prototype) {
            let responses = motifs
                .map((m) => [m, 'motifs', m.name, new Date().toISOString()])
                .map((args) => MotivicUtils.userData.processNewItem(...args))
            callBack(responses)
        },
    },
    url: {
        get: (win) => new URL(win.location.href),
        /**
         * Create new history entry.
         * @param {Window} win Fresh instance of Window.
         * @param {Object} opts Params map.
         * @param {Object} [opts.state] Data to associate with url.
         * @param {string} [opts.title] Title to associate with url.
         * @param {string} [opts.url] New url.
         */
        create: function (win, opts) {
            let state = opts.state || null
            let title = opts.title || doc.querySelector('title').textContent
            let url = opts.url || win.location.href

            win.history.pushState(state, title, url)
        },
        /**
         * Update current history entry.
         * @param {Window} win Fresh instance of Window.
         * @param {Object} opts Params map.
         * @param {Object} [opts.state] Data to associate with url.
         * @param {string} [opts.title] Title to associate with url.
         * @param {string} [opts.url] New url.
         */
        update: function (win, opts) {
            let state = opts.state || null
            let title = opts.title || doc.querySelector('title').textContent
            let url = opts.url || win.location.href

            win.history.replaceState(state, title, url)
        },
    },
    userData: {
        /**
         * Gets initial memory state from localStorage
         */
        init: function () {
            const schema = Config.userData.schema
            return Object.keys(schema).reduce((map, k) => {
                map[k] =
                    MotivicUtils.storage.get.bind(MotivicUtils.storage)(k) || []
                return map
            }, {})
        },

        /**
         * Adds a newly-created item or updates an existing one.
         * @param {Object} item New or updated item
         * @param {string} type Plural item type ('motifs', 'settings') etc
         * @param {string} name Item name
         * @param {string} id Item id, if item is pre-existing
         * @param {string} parentId Id of relative theme motif if item is variation
         * @param {Array} transformations List of transformations applied if item is variation
         */
        processNewItem: function (
            item,
            type,
            name = '',
            id = '',
            parentId = '',
            transformations = []
        ) {
            console.log(`MotivicUtils.processNewItem()`)
            console.dir({
                item,
                type,
                name,
                parentId,
                transformations,
            })
            let newItem = this._initSavedItem(
                item,
                name,
                id,
                parentId,
                transformations
            )
            console.dir(newItem)
            if (type === 'motifs' && !newItem.notes.length) {
                return [
                    false,
                    'Unable to parse midi notes from this file.',
                    newItem,
                ]
            }
            return this.persist(newItem, type, false)
        },

        _initSavedItem: function (
            item,
            name,
            id,
            parentId = '',
            transformations = []
        ) {
            let savedItem = MotivicUtils.general.clone(item)
            let initMap = {
                name,
                transformations,
                id: id || MotivicUtils.general.randomString(16),
                parentId,
                saved: { local: false, cloud: false },
            }
            // add created timestamp if there is none
            savedItem.created = savedItem.created || new Date().toISOString()
            return Object.assign(savedItem, initMap)
        },

        getNameAndVersion: function (name) {
            const split = name.split('_')
            let version = parseInt(split[split.length - 1])
            const isVersioned = !isNaN(version)
            version = isVersioned ? version : null
            let baseName = isVersioned ? split.slice(0, -1).join('_') : name
            return [baseName, version]
        },

        getNameSuffix: function (oldVersion) {
            let newSuffix = '_1'
            if (oldVersion !== null) {
                newSuffix = `_${oldVersion + 1}`
            }
            return newSuffix
        },

        /**
         * Stores a unique piece of user data in localStorage
         * @param {Object} item Item to store
         * @param {string} type Type of item
         * @param {boolean} add Should this item be added? (if false, then delete)
         */
        store: function (item, type, add = true) {
            let storedItems =
                MotivicUtils.storage.get.bind(MotivicUtils.storage)(type) || []
            const limit = Config.userData.savedItemLimit[type]
            const action = add ? 'saved' : 'deleted'
            if (add && storedItems.length >= limit) {
                const limitErrMsg = `Saved ${MotivicUtils.general.singularize(
                    type
                )} limit met! You already have ${limit} saved ${type}. \nYou must delete existing ${type} before you can save new ones.`
                return [false, limitErrMsg, item]
            }
            item.saved.local = true
            let newItemList = this.mutateList.bind(this)(
                storedItems,
                item,
                !add
            )
            try {
                MotivicUtils.storage.set.bind(MotivicUtils.storage)(
                    type,
                    newItemList
                )
                return [
                    true,
                    `${MotivicUtils.general.singularize(type)} ${
                        item.name
                    } ${action} successfully!`,
                    item,
                ]
            } catch (e) {
                return [
                    false,
                    `${MotivicUtils.general.singularize(type)} "${
                        item.name
                    }" could not be ${action} due to the following error:\n\n${
                        e.message
                    }`,
                    item,
                ]
            }
        },

        /**
         * Updates a list of items in place with a new item
         * @param {Array} list
         * @param {Object} item Item to store
         * @param {boolean} remove Should this item be deleted?
         * @returns {Array} Updated item list
         */
        mutateList: function (list, item, remove = false) {
            const itemIdx = list.findIndex(
                (listItem) => listItem.id === item.id
            )
            if (remove) {
                if (itemIdx > -1) {
                    list = list.filter((_, i) => i !== itemIdx)
                }
            } else {
                if (itemIdx > -1) {
                    list = list.map((listItem, i) =>
                        i === itemIdx ? item : listItem
                    )
                } else {
                    list = [...list, item]
                }
            }
            return list
        },
        /**
         * Validates user data item if necessary by versioning item names for uniqueness
         * @param {Object} item Item to store
         * @param {string} type Type of item (motifs, settings, etc)
         * @returns {Object} validated item
         */
        validate: function (item, type) {
            const existingItemNames = win.MOTIVIC.user[type].map((m) => m.name)
            const nameMap = existingItemNames
                .map(this.getNameAndVersion)
                .reduce((map, [name, version]) => {
                    if (name in map) {
                        map[name] = Math.max(map[name], version)
                    } else {
                        map[name] = version
                    }
                    return map
                }, {})
            const existingNames = Object.keys(nameMap).map((k) => k)
            let [thisName] = this.getNameAndVersion(item.name)
            if (existingNames.includes(thisName)) {
                item.name = `${thisName}${this.getNameSuffix(
                    nameMap[thisName]
                )}`
            }
            return item
        },
        /**
         * Saves user data items to memory and localStorage if indicated
         * @param {Object} item Item to store
         * @param {string} type Type of item (motifs, settings, etc)
         * @param {boolean} store Should this motif be persisted to localStorage?
         */
        persist: function (item, type, store = false) {
            // Storing the item in active memory
            const itemStoreMap = { motifs: motifStore, settings: settingStore }
            itemStoreMap[type].add(item)
            return store
                ? this.store.bind(this)(item, type)
                : [
                      true,
                      `${MotivicUtils.general.singularize(type)} ${
                          item.name
                      } saved to memory successfully!`,
                      item,
                  ]
        },

        /**
         * Removes user data items from memory and localStorage
         * @param {Object} item Item to remove
         * @param {string} type Type of item (motifs, settings, etc)
         */
        remove: function (item, type) {
            // Removing the item from active memory
            const itemStoreMap = { motifs: motifStore, settings: settingStore }
            itemStoreMap[type].remove(item)
            // deleting the item from localStorage
            return this.store.bind(this)(item, type, false)
        },

        getItems: function (type, filterFn) {
            return win[Config.nameSpace].user[type].filter(filterFn)
        },
    },
    storage: {
        init: function () {
            let storage = this.get.bind(this)() || {}
            const schema = Config.userData.schema
            Object.keys(schema).forEach((k) => {
                storage[k] = storage[k] || schema[k]
            })
            try {
                this.set.bind(this)(Config.nameSpace, storage)
            } catch (e) {
                throw e
            }
        },

        set: function (key, value) {
            let storage = {}
            try {
                storage = this.get.bind(this)() || {}
            } catch (e) {
                throw e
            }

            if (key !== Config.nameSpace) {
                storage[key] = value
            } else {
                storage = value
            }
            try {
                this.update.bind(MotivicUtils.storage)(storage)
            } catch (e) {
                throw e
            }
        },

        update: function (payload) {
            try {
                localStorage.setItem(Config.nameSpace, JSON.stringify(payload))
            } catch (err) {
                console.error(err)
                throw new Error(
                    `Your browser's localStorage is full or unavailable. Please clear cache or close browser windows.`
                )
            }
        },

        get: function (key = null) {
            let storage = {}
            try {
                storage = JSON.parse(localStorage.getItem(Config.nameSpace))
            } catch (e) {
                console.error(
                    `error retrieving localStorage${key && `for key ${key}`}`
                )
                console.error(e)
                throw e
            }
            return key ? storage[key] : storage
        },
    },
}

export default MotivicUtils
