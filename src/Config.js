const nameSpace = "MOTIVIC";
const Config = {
  audio: {
    playSettings: {
      attack: 1,
      release: 100,
      volume: 1,
      type: "sine",
      timeLine: 0
    },
    voices: [
      ["sine", "sine"],
      ["square", "square"],
      ["sawtooth", "saw"],
      ["triangle", "tri"]
    ]
  },
  nameSpace: nameSpace,
  views: [
    "about",
    "note grid",
    "randomizer",
    "transformer",
    "uploader",
    "motifs"
  ],
  homePage: "randomizer",
  feature: {
    editMelody: false,
    userAccounts: false,
    cloudSave: false,
    noteGrid: false,
    crudAPI: false,
    savedSettings: false
  },
  timeSignatureBeats: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  timeSignatureUnits: [1, 2, 4, 8, 12, 16],
  notes: ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"],
  frequencies: [
    {
      // octave 0
      c: 16.351,
      "c#": 17.324,
      db: 17.324,
      d: 18.354,
      "d#": 19.445,
      eb: 19.445,
      e: 20.601,
      f: 21.827,
      "f#": 23.124,
      gb: 23.124,
      g: 24.499,
      "g#": 25.956,
      ab: 25.956,
      a: 27.5,
      "a#": 29.135,
      bb: 29.135,
      b: 30.868
    },
    {
      // octave 1
      c: 32.703,
      "c#": 34.648,
      db: 34.648,
      d: 36.708,
      "d#": 38.891,
      eb: 38.891,
      e: 41.203,
      f: 43.654,
      "f#": 46.249,
      gb: 46.249,
      g: 48.999,
      "g#": 51.913,
      ab: 51.913,
      a: 55,
      "a#": 58.27,
      bb: 58.27,
      b: 61.735
    },
    {
      // octave 2
      c: 65.406,
      "c#": 69.296,
      db: 69.296,
      d: 73.416,
      "d#": 77.782,
      eb: 77.782,
      e: 82.407,
      f: 87.307,
      "f#": 92.499,
      gb: 92.499,
      g: 97.999,
      "g#": 103.826,
      ab: 103.826,
      a: 110,
      "a#": 116.541,
      bb: 116.541,
      b: 123.471
    },
    {
      // octave 3
      c: 130.813,
      "c#": 138.591,
      db: 138.591,
      d: 146.832,
      "d#": 155.563,
      eb: 155.563,
      e: 164.814,
      f: 174.614,
      "f#": 184.997,
      gb: 184.997,
      g: 195.998,
      "g#": 207.652,
      ab: 207.652,
      a: 220,
      "a#": 233.082,
      bb: 233.082,
      b: 246.942
    },
    {
      // octave 4
      c: 261.626,
      "c#": 277.183,
      db: 277.183,
      d: 293.665,
      "d#": 311.127,
      eb: 311.127,
      e: 329.628,
      f: 349.228,
      "f#": 369.994,
      gb: 369.994,
      g: 391.995,
      "g#": 415.305,
      ab: 415.305,
      a: 440,
      "a#": 466.164,
      bb: 466.164,
      b: 493.883
    },
    {
      // octave 5
      c: 523.251,
      "c#": 554.365,
      db: 554.365,
      d: 587.33,
      "d#": 622.254,
      eb: 622.254,
      e: 659.255,
      f: 698.456,
      "f#": 739.989,
      gb: 739.989,
      g: 783.991,
      "g#": 830.609,
      ab: 830.609,
      a: 880,
      "a#": 932.328,
      bb: 932.328,
      b: 987.767
    },
    {
      // octave 6
      c: 1046.502,
      "c#": 1108.731,
      db: 1108.731,
      d: 1174.659,
      "d#": 1244.508,
      eb: 1244.508,
      e: 1318.51,
      f: 1396.913,
      "f#": 1479.978,
      gb: 1479.978,
      g: 1567.982,
      "g#": 1661.219,
      ab: 1661.219,
      a: 1760,
      "a#": 1864.655,
      bb: 1864.655,
      b: 1975.533
    },
    {
      // octave 7
      c: 2093.005,
      "c#": 2217.461,
      db: 2217.461,
      d: 2349.318,
      "d#": 2489.016,
      eb: 2489.016,
      e: 2637.021,
      f: 2793.826,
      "f#": 2959.955,
      gb: 2959.955,
      g: 3135.964,
      "g#": 3322.438,
      ab: 3322.438,
      a: 3520,
      "a#": 3729.31,
      bb: 3729.31,
      b: 3951.066
    },
    {
      // octave 8
      c: 4186.009,
      "c#": 4434.922,
      db: 4434.922,
      d: 4698.636,
      "d#": 4978.032,
      eb: 4978.032,
      e: 5274.042,
      f: 5587.652,
      "f#": 5919.91,
      gb: 5919.91,
      g: 6271.928,
      "g#": 6644.876,
      ab: 6644.876,
      a: 7040,
      "a#": 7458.62,
      bb: 7458.62,
      b: 7902.132
    },
    {
      // octave 9
      c: 8372.018,
      "c#": 8869.844,
      db: 8869.844,
      d: 9397.272,
      "d#": 9956.064,
      eb: 9956.064,
      e: 10548.084,
      f: 11175.304,
      "f#": 11839.82,
      gb: 11839.82,
      g: 12543.856,
      "g#": 13289.752,
      ab: 13289.752,
      a: 14080,
      "a#": 14917.24,
      bb: 14917.24,
      b: 15804.264
    }
  ],
  modes: {
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // all 12 notes
    whole: [0, 2, 4, 6, 8, 10],
    ionian: [0, 2, 4, 5, 7, 9, 11], // aka Major scale
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10], // aka Minor scale
    locrian: [0, 1, 3, 5, 6, 8, 10]
  },
  gridDisplayColumns: [8, 16, 32, 64],
  gridDisplayWidth: 300,
  gridDisplayHeight: 300,
  gridDisplayOctaveLow: 3,
  gridDisplayOctaveHigh: 4,
  gridDimensionsMap: {
    small: 300,
    medium: 400,
    large: 500
  },
  gridLabelSizeMap: {
    small: { width: 20, fontSize: 12, yOffset: -9 },
    medium: { width: 30, fontSize: 15, yOffset: -13 },
    large: { width: 40, fontSize: 20, yOffset: -17 }
  },
  itemCrudModalDefaultProps: {
    itemType: "",
    item: null,
    itemChildren: [],
    formType: "",
    show: false,
    actionComplete: false
  },
  rhythmicUnit: 64,
  midiTicksPerQuarterNote: 128,
  percentOfRests: 33,
  default: {
    octave: {
      low: 0,
      middle: 4,
      high: 8
    },
    timeSignature: {
      beat: 4,
      unit: 4
    },
    bpm: 120,
    key: "c",
    mode: "chromatic",
    voice: "sine",
    note: {
      pitch: "c",
      value: 49,
      octave: 4,
      duration: {
        // Setting the shortest randomly-generated note to a 16th note (4/64)
        min: 4,
        // Setting the longest randomly-generated note to a whole note (64/64)
        max: 32
      }
    },
    melody: {
      length: 2,
      // Smallest & largest step-jumps allowed between notes in a melody.
      leap: {
        min: 1,
        max: 24
      }
    }
  },
  api: {
    baseURL: "https://motivic.io/api",
    operations: {
      randomizer: {
        path: "/melody/random",
        method: "POST",
        mode: "cors",
        headers: new Headers({ "Content-Type": "application/json" })
      },
      transformer: {
        path: "/melody/transform",
        method: "POST",
        mode: "cors",
        headers: new Headers({ "Content-Type": "application/json" })
      }
    },
    crud: {
      createOneMotif: { method: "POST", path: "/motif" },
      createMultipleMotifs: { method: "POST", path: "/motifs" },
      readOneMotif: { method: "GET", path: "/motif", params: ["id"] },
      readMultipleMotifs: { method: "GET", path: "/motifs", params: ["id"] },
      updateOneMotif: { method: "PUT", path: "/motif" },
      updateMultipleMotifs: { method: "PUT", path: "/motifs" },
      deleteOneMotif: { method: "DELETE", path: "/motif" },
      deleteMultipleMotifs: { method: "DELETE", path: "/motifs" }
    }
  },
  userData: {
    schema: {
      motifs: [],
      settings: []
    },
    savedItemLimit: {
      motifs: 10,
      settings: 10
    }
  },
  paginationViews: { motifs: `${nameSpace}.user.motifs` },
  pagination: {
    itemsPerPage: 10
  },
  downloadFileTypes: ["midi", "json"],
  motifSorts: ["created", "name"],
  motifGenerationDisplayCount: 2
};
export default Config;
