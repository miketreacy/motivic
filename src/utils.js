import Midi from "jsmidgen";
import MIDIParser from "midi-parser-js";
import Config from "./Config.js";
import { motifStore, settingStore } from "./Stores.js";
let win = window;
let doc = document;
const Utils = {
  general: {
    clone: function(val) {
      return JSON.parse(JSON.stringify(val));
    },
    /**
     * Generates and returns a random alphanumeric string. Will return only alpha or numeric
     * characters if optional type argument is passed.
     * @param {number} length The length of the random string we wish to generate.
     * @param {string} [type] Optional type of string (alpha or num).
     * @returns {string} A random alphanumeric string.
     */
    randomString: function(length, type = "alphaNum") {
      let alpha = "abcdefghijklmnopqrstuvwxyz";
      let num = "0123456789";
      let charMap = {
        alpha: alpha.toUpperCase() + alpha,
        num: num,
        alphaNum: num + alpha + num + alpha.toUpperCase() + num
      };
      let text = "";

      for (let i = 0; i < length; i++) {
        let map = charMap[type];
        text += map.charAt(Math.floor(Math.random() * map.length));
      }
      return text;
    },

    /**
     * simple util for getting a singular string from plural string
     * @param {string} str String to singularize
     * @returns {string} Singularized string
     */
    singularize: function(str) {
      let split = str.split("");
      return split.filter((char, i, arr) => i < arr.length - 1).join("");
    }
  },
  http: {
    awaitFetch: async function(url, params) {
      try {
        let res = await win.fetch(url, params);
        return await res.json();
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
  },
  melody: {
    getVoice: function() {
      return [...doc.querySelectorAll("#voice option")].filter(
        el => el.selected
      )[0].dataset.voice;
    },

    /**
     * Returns an ordered reference set of scientific pitches up to and including the given octave number.
     * @param {number} [lowOctave] Lowest octave to be included in set.
     * @param {number} highOctave Highest octave to be included in set.
     * @param {string} initialPitch First pitch in set.
     * @returns {Array} Ordered set of scientific pitches from low to high.
     */
    getPitchSet: function(
      lowOctave = Config.default.octave.low,
      highOctave = Config.default.octave.high,
      initialPitch = Config.default.note.pitch
    ) {
      let noteSet = Array.from(Config.notes);
      let seq = this.sequencePitches(noteSet, initialPitch);
      let set = [];

      for (let i = lowOctave; i < highOctave + 1; i++) {
        seq.forEach((n, idx) => {
          set.push({
            name: n,
            octave: i,
            value: i * 12 + idx + 1
          });
        });
      }
      return set;
    },

    getKeySet: function(key, mode, pitches) {
      let keySet = [];
      Config.modes[mode].forEach(step => {
        keySet.push(pitches[step].name);
      });
      return keySet;
    },

    noteIsValid: function(noteName, set) {
      return set.includes(noteName) || noteName === "rest";
    },

    // TODO: Allow for sharpening or flattening depending on location of nearest scale tone (currently just sharpens up to tone)
    // TODO: ~or~ Make it sharpen or flatten to scale depending on if new key is above or below existing key.
    /**
     * Transforms a given note value to fit a given scale.
     * @param {number} value Value to transform.
     * @param {Array} keySet Set of pitches in the desired scale.
     * @returns {number} Transformed pitch value.
     */
    transformNoteValue: function(value, keySet) {
      let newVal = value + 1;
      let name = this.getNoteName(newVal);
      let result = newVal;
      if (!this.noteIsValid(name, keySet)) {
        result = this.transformNoteValue(newVal, keySet);
      }
      return result;
    },

    getNoteInterval: function(note, keySet) {
      return note.name === "rest"
        ? null
        : keySet.findIndex(k => k === note.name) + 1;
    },

    getKeyFilteredValue: function(value, keySet) {
      let name = this.getNoteName(value);
      let result = value;

      if (!this.noteIsValid(name, keySet)) {
        result = this.transformNoteValue(value, keySet);
      }
      return result;
    },

    sequencePitches: function(pitches, pitch) {
      let tonicIndex = pitches.findIndex(p => p === pitch);
      let set = pitches.splice(tonicIndex);
      set = set.concat(pitches);
      return set;
    },

    /**
     * Filters through set of notes and returns the pitch of the first note that has a truthy pitch value.
     * @param {Array} melody Set of note maps.
     * @returns {string} Initial pitch of note set.
     */
    getInitialPitch: melody => melody.filter(n => n.value)[0],

    // TODO: one scope to rule them all, and in the closure bind them
    // TODO: calculates all computed properties based on the two crucial ones (value & duration)

    /**
     * Returns a new note object for a given value and duration.
     * @param {number} value Absolute value of note pitch.
     * @param {number} duration Duration of note in 64th beats.
     * @param {Object} melody Represents a melody, complete or during generation.
     * @param {string} melody.key Key note of melody.
     * @param {string} melody.mode Mode (aka scale) of melody by name.
     * @param {Array} melody.notes Array of objects representing melody notes.
     * @param {number} noteIdx Index of note within melody array.
     * @returns {Object} New note instance.
     */
    getNote: function(
      value,
      duration,
      melody,
      noteIdx = melody.notes.length - 1
    ) {
      let key = melody.key || this.getInitialPitch(melody.notes);
      let mode = melody.mode || "chromatic";
      let pitchSet = this.getPitchSet(0, 0, key);
      let keySet = this.getKeySet(key, mode, pitchSet);
      let isRest = value === null;
      let thisValue = (v => {
        let val = v;
        if (!isRest) {
          val = val < 0 ? (val % 12) + 12 : val;
          val = this.getKeyFilteredValue(val, keySet);
        }
        return val;
      })(value);
      let name = isRest ? "rest" : this.getNoteName(thisValue);
      let octave = isRest ? null : this.getNoteOctave(thisValue);
      let pitch = name + (typeof octave === "number" ? octave : "");
      let initialPitch = this.getInitialPitch(melody.notes);
      let steps = isRest
        ? null
        : thisValue - (initialPitch ? initialPitch.value : thisValue);
      let interval = this.getNoteInterval(
        {
          name
        },
        keySet
      );
      let startingBeat =
        melody.notes
          .slice(0, noteIdx)
          .reduce((total, note) => total + note.duration, 0) + 1;
      return {
        value: thisValue,
        name,
        octave,
        pitch,
        duration,
        steps,
        startingBeat,
        interval
      };
    },

    getNoteName: function(value = Config.default.note.value) {
      let noteModulo = value % 12;
      let noteIndex = noteModulo ? noteModulo - 1 : 11;
      let octavePitches = this.getPitchSet(0, 0);
      return octavePitches[noteIndex].name;
    },

    getNoteOctave: function(value = Config.default.note.value) {
      let noteModulo = value % 12;
      return noteModulo ? Math.floor(value / 12) : Math.floor(value / 12) - 1;
    }
  },
  file: {
    midi: {
      getBPM: function(microSecondsPerQuarterNote) {
        let microSecondsPerMinute = 60000000;
        return Math.round(microSecondsPerMinute / microSecondsPerQuarterNote);
      },

      getNextNoteOffEvent: function(arr, idx) {
        return arr.slice(idx + 1).find(e => e.type === 8);
      },

      getTicks: function(noteDuration, timeSig) {
        return (
          (noteDuration * (Config.midiTicksPerQuarterNote * timeSig)) /
          Config.rhythmicUnit
        );
      },

      parseFile: function(data, name) {
        let result = MIDIParser.Base64(data);
        let bpm;
        let motifs = result.track.map(t => {
          let melody = { notes: [] };
          melody.notes = t.event.reduce((notes, e, i, a) => {
            // tempo event
            if (e.type === 255 && e.metaType === 81) {
              bpm = this.getBPM(e.data);
            }
            // noteOn event
            if (e.type === 9) {
              if (e.deltaTime) {
                // this accounts for any rests preceding the noteOn event
                notes.push({ value: null, duration: e.deltaTime / 8 });
              }
              // this is the note itself, getting duration from the next noteOff deltaTime
              notes.push({
                value: e.data[0] - 11,
                duration: this.getNextNoteOffEvent(a, i).deltaTime / 8
              });
            }
            return notes;
          }, []);
          return melody;
        });

        motifs = motifs.map(m => {
          m.bpm = bpm;
          m.name = `${name}_midi-import`;
          m.mode = "chromatic";
          m.notes = m.notes.map((n, i) =>
            Utils.melody.getNote.bind(Utils.melody)(n.value, n.duration, m, i)
          );
          return m;
        });
        return motifs;
      },

      handler: function(fileName) {
        return function(e) {
          let motifs = Utils.file.midi.parseFile.bind(Utils.file.midi)(
            e.target.result,
            fileName
          );
          Utils.file.parseCallback(motifs);
        };
      },

      getMelody: function(melody) {
        let timeSig = melody.timeSignature[0];
        let midiNotes = [];
        let delayTicks = 0;
        melody.notes.forEach(note => {
          if (note.value) {
            midiNotes.push({
              channel: 0,
              duration: this.getTicks(note.duration, timeSig),
              pitch: note.pitch,
              time: delayTicks
            });
            delayTicks = 0;
          } else {
            delayTicks = delayTicks + this.getTicks(note.duration, timeSig);
          }
        });
        return midiNotes;
      },

      getTrack: function(melody) {
        let track = new Midi.Track();
        let midiNotes = this.getMelody(melody);

        track.setTempo(melody.bpm);
        midiNotes.forEach(note => {
          track.addNote(note.channel, note.pitch, note.duration, note.time);
        });

        return track;
      },

      download: function(motifs = []) {
        let a = doc.createElement("a");
        let file = new Midi.File();

        motifs.forEach(m => file.addTrack(this.getTrack(m)));
        a.download = `${motifs[0].name}.midi`;
        a.href = "data:audio/midi;base64," + win.btoa(file.toBytes());
        a.click();
      }
    },

    json: {
      download: function(motifs = []) {
        let a = doc.createElement("a");
        let data = JSON.stringify(motifs, undefined, 4);
        let blob = new Blob([data], { type: "text/json" });

        a.id = "FUCK";
        a.download = `${motifs[0].name}.json`;
        a.href = win.URL.createObjectURL(blob);
        a.click();
        win.URL.revokeObjectURL(a.href);
      },

      handler: function(fileName) {
        return function(e) {
          let str = e.target.result;
          let json = JSON.parse(str);
          let motifs = json.map(m => {
            m.name = `${m.name || fileName}_json-import`;
            return m;
          });
          Utils.file.parseCallback(motifs);
        };
      }
    },

    wav: {
      download: function(motifs = []) {
        // TODO: wire up call to motivic_convertor WAV API
        console.log(`Call motivic_convertor API once deployed`);
      }
    },

    parseCallback: function(motifs) {
      //TODO: call processNewMotif here
      // motifs.forEach(Utils.motif.persist.bind(Utils.motif));
      // Utils.motif.renderMotifs.bind(Utils.motif)();
      // Utils.grid.displayMelody.bind(Utils.grid)(motifs[0]);
      win.alert(`Motif: '${motifs[0].name}' uploaded successfully!`);
    }
  },
  url: {
    get: win => new URL(win.location.href),
    /**
     * Create new history entry.
     * @param {Window} win Fresh instance of Window.
     * @param {Object} opts Params map.
     * @param {Object} [opts.state] Data to associate with url.
     * @param {string} [opts.title] Title to associate with url.
     * @param {string} [opts.url] New url.
     */
    create: function(win, opts) {
      let state = opts.state || null;
      let title = opts.title || doc.querySelector("title").textContent;
      let url = opts.url || win.location.href;

      win.history.pushState(state, title, url);
    },
    /**
     * Update current history entry.
     * @param {Window} win Fresh instance of Window.
     * @param {Object} opts Params map.
     * @param {Object} [opts.state] Data to associate with url.
     * @param {string} [opts.title] Title to associate with url.
     * @param {string} [opts.url] New url.
     */
    update: function(win, opts) {
      let state = opts.state || null;
      let title = opts.title || doc.querySelector("title").textContent;
      let url = opts.url || win.location.href;

      win.history.replaceState(state, title, url);
    }
  },
  userData: {
    /**
     * Gets initial memory state from localStorage
     */
    init: function() {
      const schema = Config.userData.schema;
      return Object.keys(schema).reduce((map, k) => {
        map[k] = Utils.storage.get.bind(Utils.storage)(k) || [];
        return map;
      }, {});
    },

    /**
     * Adds a newly-created item or updates an existing one.
     * @param {Object} item New or updated item
     * @param {string} type Plural item type ('motifs', 'settings') etc
     * @param {string} name Item name
     * @param {string} id Item id, if item is pre-existing
     * @param {string} parentId Id of relative theme motif if item is variation
     * @param {Array} transformations List of transformations applied if item is variation
     * @param {boolean} store Should item be persisted in localStorage?
     */
    processNewItem: function(
      item,
      type,
      name = "",
      id = "",
      parentId = "",
      transformations = [],
      store = false
    ) {
      console.log(`Utils.processNewItem()`);
      console.dir({
        item,
        type,
        name,
        parentId,
        transformations,
        store
      });
      let newItem = this.initSavedItem(
        item,
        name,
        id,
        parentId,
        transformations
      );
      console.dir(newItem);
      return this.persist(newItem, type, store);
    },

    initSavedItem: function(item, name, id, parentId = "", transformations) {
      let savedItem = Utils.general.clone(item);
      let initMap = {
        name,
        transformations,
        id: id || Utils.general.randomString(8),
        parent: parentId,
        saved: { local: false, cloud: false },
        created: new Date(item.createdTS).toLocaleString()
      };

      return Object.assign(savedItem, initMap);
    },

    getNameAndVersion: function(name) {
      const split = name.split("_");
      let version = parseInt(split[split.length - 1]);
      const isVersioned = !isNaN(version);
      version = isVersioned ? version : null;
      let baseName = isVersioned ? split.slice(0, -1).join("_") : name;
      return [baseName, version];
    },

    getNameSuffix: function(oldVersion) {
      let newSuffix = "_1";
      if (oldVersion !== null) {
        newSuffix = `_${oldVersion + 1}`;
      }
      return newSuffix;
    },

    /**
     * Stores a unique piece of user data in localStorage
     * @param {Object} item Item to store
     * @param {string} type Type of item
     * @param {boolean} add Should this item be added? (if false, then delete)
     */
    store: function(item, type, add = true) {
      let storedItems = Utils.storage.get.bind(Utils.storage)(type);
      const limit = Config.userData.savedItemLimit[type];
      const action = add ? "saved" : "deleted";
      if (storedItems.length >= limit) {
        const errMsg = `Saved ${type} limit met! You already have ${limit} saved ${type}. \nYou must delete existing ${type} before you can save new ones.`;
        throw new Error(errMsg);
      }
      item.saved.local = true;
      let newItemList = this.mutateList.bind(this)(storedItems, item, !add);
      try {
        Utils.storage.set.bind(Utils.storage)(type, newItemList);
        return [
          true,
          `${Utils.general.singularize(type)} ${
            item.name
          } ${action} successfully!`,
          item
        ];
      } catch (e) {
        return [
          false,
          `${Utils.general.singularize(type)} ${
            item.name
          } could not be ${action} due to an error.`,
          item
        ];
      }
    },

    /**
     * Updates a list of items in place with a new item
     * @param {Array} list
     * @param {Object} item Item to store
     * @param {boolean} remove Should this item be deleted?
     * @returns {Array} Updated item list
     */
    mutateList: function(list, item, remove = false) {
      const itemIdx = list.findIndex(listItem => listItem.id === item.id);
      if (remove) {
        if (itemIdx > -1) {
          // list[idx] = null;
          // list = list.filter(m => m);
          list = list.filter((_, i) => i !== itemIdx);
        }
      } else {
        if (itemIdx > -1) {
          // list[idx] = item;
          list = list.map((listItem, i) => (i === itemIdx ? item : listItem));
        } else {
          list = [...list, item];
        }
      }
      return list;
    },
    /**
     * Validates user data item if necessary
     * @param {Object} item Item to store
     * @param {string} type Type of item (motifs, settings, etc)
     * @returns {Object} validated item
     */
    validate: function(item, type) {
      const existingItemNames = win.MOTIVIC.user[type].map(m => m.name);
      const nameMap = existingItemNames
        .map(this.getNameAndVersion)
        .reduce((map, [name, version]) => {
          if (name in map) {
            map[name] = Math.max(map[name], version);
          } else {
            map[name] = version;
          }
          return map;
        }, {});
      const existingNames = Object.keys(nameMap).map(k => k);
      let [thisName] = this.getNameAndVersion(item.name);
      if (existingNames.includes(thisName)) {
        item.name = `${thisName}${this.getNameSuffix(nameMap[thisName])}`;
      }
      return item;
    },
    /**
     * Saves user data items to memory and localStorage if indicated
     * @param {Object} item Item to store
     * @param {string} type Type of item (motifs, settings, etc)
     * @param {boolean} store Should this motif be persisted to localStorage?
     */
    persist: function(item, type, store = false) {
      const validatedItem = this.validate.bind(this)(item, type);
      // Storing the item in active memory
      const itemStoreMap = { motifs: motifStore, settings: settingStore };
      itemStoreMap[type].add(item);
      return store
        ? this.store.bind(this)(item, type)
        : [
            true,
            `${Utils.general.singularize(type)} ${
              item.name
            } saved to memory successfully!`,
            item
          ];
    },

    /**
     * Saves user data items to memory and localStorage if indicated
     * @param {Object} item Item to store
     * @param {string} type Type of item (motifs, settings, etc)
     */
    remove: function(item, type) {
      // Removing the item from active memory
      const itemStoreMap = { motifs: motifStore, settings: settingStore };
      itemStoreMap[type].remove(item);
      // deleting the item from localStorage
      return this.store.bind(this)(item, type, false);
    },

    getItems: function(type, filterFn) {
      return win[Config.nameSpace].user[type].filter(filterFn);
    }
  },
  storage: {
    init: function() {
      let storage = this.get.bind(this)() || {};
      const schema = Config.userData.schema;
      Object.keys(schema).forEach(k => {
        storage[k] = storage[k] || schema[k];
      });
      this.set.bind(this)(Config.nameSpace, storage);
    },

    set: function(key, value) {
      let storage = {};
      try {
        storage = this.get.bind(this)() || {};
      } catch (e) {
        throw e;
      }

      if (key !== Config.nameSpace) {
        storage[key] = value;
      } else {
        storage = value;
      }
      this.update.bind(Utils.storage)(storage);
    },

    update: function(payload) {
      try {
        localStorage.setItem(Config.nameSpace, JSON.stringify(payload));
      } catch (err) {
        console.error(`error setting localStorage`);
        console.error(err);
        // win.alert(`ERROR: Local storage unavailable. Please clear cache or close browser windows.`)
        throw new Error(
          `ERROR: Local storage unavailable. Please clear cache or close browser windows.`
        );
      }
    },

    get: function(key = null) {
      let storage = {};
      try {
        storage = JSON.parse(localStorage.getItem(Config.nameSpace));
      } catch (e) {
        console.error(
          `error retrieving localStorage${key && `for key ${key}`}`
        );
        console.error(e);
        throw e;
      }
      return key ? storage[key] : storage;
    }
  }
};

export default Utils;
