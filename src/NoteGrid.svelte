<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import Config from "./Config.js";
  import Utils from "./Utils.js";
  import Grid from "./Grid.svelte";
  import Field from "./Field.svelte";
  export let width = Config.gridDisplayWidth;
  export let height = Config.gridDisplayHeight;
  export let motifs = [];
  export let octaveLow = 3;
  export let octaveHigh = 4;
  export let writable = true;

  const numberOfPitches = 12;
  const gridDisplayOctaveLow = 3;
  const gridDisplayOctaveHigh = 4;
  const gridDimensionsMap = {
    small: 300,
    medium: 400,
    large: 500
  };
  const gridLabelSizeMap = {
    small: { width: 20, fontSize: 12, yOffset: -9 },
    medium: { width: 30, fontSize: 15, yOffset: -13 },
    large: { width: 40, fontSize: 20, yOffset: -17 }
  };
  const gridDisplayFields = [
    {
      type: "select",
      id: "octave_low",
      label: "Low Octave",
      value: 3,
      options: Config.gridDisplayOctaves,
      info: "Uses piano octaves (Scientific Pitch Notation)"
    },
    {
      type: "select",
      id: "octave_high",
      label: "High Octave",
      value: 4,
      options: Config.gridDisplayOctaves,
      info: "Uses piano octaves (Scientific Pitch Notation)"
    },
    {
      type: "select",
      id: "grid-display-columns",
      label: "Columns",
      value: 8,
      options: Config.gridDisplayColumns,
      info: "Number of grid columns to display"
    }
  ];

  let columns;
  let rows;
  let pitchSet;
  let innerWidth;
  let selectedColumns = 8;
  let selectedOctaves = {
    low: gridDisplayOctaveLow,
    high: gridDisplayOctaveHigh
  };
  let cellDuration;
  let gridViewBox;

  function getGridSize() {
    let gridSize = innerWidth > 768 ? "medium" : "small";
    return innerWidth > 1024 ? "large" : gridSize;
  }

  function getGridDimensions() {
    let gridSize = getGridSize();
    return {
      width: Config.gridDimensionsMap[gridSize],
      height: Config.gridDimensionsMap[gridSize]
    };
  }

  function getMelodyColumns(melody) {
    return Config.gridDisplayColumns.find(num =>
      melody.notes.every(n => n.duration % (Config.rhythmicUnit / num) === 0)
    );
  }

  function getMelodyOctaves(melody) {
    let melodyOctaves = melody.notes
      .filter(n => typeof n.octave === "number")
      .map(n => n.octave);
    return {
      low: Math.min(melodyOctaves),
      high: Math.max(melodyOctaves)
    };
  }

  function renderNote(cols) {
    let beatsPerCol = Config.rhythmicUnit / cols;
    return note => {
      let colsPerNote = note.duration / beatsPerCol;
      let gridStartingCol =
        Math.floor(note.startingBeat / beatsPerCol) +
        (note.startingBeat % beatsPerCol);
      let noteCells = [];

      if (note.value) {
        for (let i = gridStartingCol; i < gridStartingCol + colsPerNote; i++) {
          const selector = `#grid .row[data-note-value="${note.value}"] .cell[data-column="${i}"]`;
          let noteCell = doc.querySelector(selector);
          //TODO: make sure there is no bug here when noteCell is null
          if (noteCell) {
            selectCell(noteCell, false);
            noteCells.push(noteCell);
          }
        }
        if (noteCells.length > 1) {
          tieCells(noteCells, false);
        }
      }
    };
  }

  // find out the optimal number of columns for melody display
  // TODO: re-render grid display controls to update allowed rows & cols options for each new displayed melody (# of rows, # of cols)
  // TODO: handle multi-measure melody display

  function resetGrid() {
    doc
      .querySelectorAll("#grid .cell.selected, #grid .cell.tie-candidate")
      .forEach(deSelectCell);
  }

  function getNoteDuration(el) {
    let dur = 4;
    if (el) {
      let isTied = el.classList.contains("tied");

      if (isTied) {
        let tieMates = [
          ...doc.querySelectorAll(`[data-tie_id="${el.dataset.tie_id}"]`)
        ];
        let isFirstCol = tieMates[0].dataset.column === el.dataset.column;
        dur = isFirstCol ? tieMates.length * 4 : 0;
      }
    }
    return dur;
  }

  function getMelody() {
    let columns = doc.querySelector("#grid .row").childElementCount;
    let notes = [];

    for (let i = 0; i < columns; i++) {
      let selectedNote = doc.querySelector(`.selected[data-column="${i + 1}"]`);
      let note = {
        value: selectedNote ? parseInt(selectedNote.dataset.note_value) : null,
        duration: getNoteDuration(selectedNote),
        name: selectedNote ? selectedNote.dataset.note_name : null
      };

      if (note.duration !== 0) {
        // using note.duration = 0 to indicate trailing note in tied-notes array
        notes.push(note);
      }
    }
    console.dir(notes);
    return notes;
  }

  function mapMelody(melody) {
    let initPitch = Utils.melody.getInitialPitch(melody).name;
    let newMelody = {
      key: initPitch.slice(0, initPitch.length - 1),
      mode: "chromatic",
      notes: [],
      time_signature: [
        parseInt(
          doc.querySelector("#input-controls .time_signature_beat").value
        ),
        parseInt(
          doc.querySelector("#input-controls .time_signature_unit").value
        )
      ],
      bpm: parseInt(doc.querySelector("#input-controls .tempo").value)
    };
    melody.forEach((note, i) => {
      let newNote = Utils.melody.getNote(
        note.value,
        note.duration,
        newMelody,
        i
      );
      newMelody.notes.push(newNote);
    });
    return newMelody;
  }

  /**
   * Enforces field validation logic on grid display column inputs
   * @param e
   */
  function gridDisplayOctave(e) {
    const isMobView = innerWidth < 768;
    const inputEl = e.target;
    const otherInputEl = doc.querySelector(
      `input.display_octave:not(#${inputEl.id})`
    );
    let inputVal = parseInt(inputEl.value);
    let otherInputVal = parseInt(otherInputEl.value);
    const isHigh = inputEl.id === "display-octave-high";
    if (isHigh) {
      // is the high octave field
      if (isMobView) {
        if (otherInputVal < inputVal) {
          otherInputEl.value = Math.max(inputVal - 1, 0);
        } else {
          otherInputEl.value = inputVal;
        }
      }
      inputEl.value = Math.max(parseInt(otherInputEl.value), inputVal);
    } else {
      // is the low octave field
      if (isMobView) {
        if (otherInputVal > inputVal) {
          otherInputEl.value = Math.min(inputVal + 1, otherInputEl.value);
        } else {
          otherInputEl.value = Math.max(inputVal, otherInputEl.value);
        }
      }
      inputEl.value = Math.min(parseInt(otherInputEl.value), inputVal);
    }
  }
  function saveGridMelody() {
    let gridMelody = mapMelody(getMelody());
    let name =
      doc.querySelector("#input-controls .name").value || "My Grid Motif";
    processNewMotif(gridMelody, name, "theme", "", "Grid melody created");
  }

  function getGridViewBox(width, height, columns, rows) {
    let x = width / (columns + 1);
    let y = height / rows;
    console.info(`getGridViewBox() ${x} ${y} ${width} ${height}`);
    return `${x} ${y} ${width} ${height}`;
  }

  function getCellDuration(columns) {
    let durMap = {
      "8": "an 8th",
      "16": "a 16th",
      "32": "a 32nd",
      "64": "a 64th"
    };
    return durMap[columns.toString()];
  }

  function getNoteValueRowMap(rows, pitchSet) {
    let pitches = pitchSet.slice().reverse();
    // match note.value to row
    let noteValueRowMap = [...Array(rows).keys()]
      .map(n => n + 1)
      .reduce((map, row, idx) => {
        let note = pitches[idx];
        map[note.value] = row;
        return map;
      }, {});
    console.log(`noteValueRowMap`, noteValueRowMap);
    return noteValueRowMap;
  }

  function getRowByNoteValue(noteValue) {
    let minVal = Math.min(...Object.keys(noteValueRowMap));
    let maxVal = Math.max(...Object.keys(noteValueRowMap));
    let tooBig = noteValue > maxVal;
    let tooSmall = noteValue < minVal;

    if (!tooBig && !tooSmall) {
      return noteValueRowMap[noteValue];
    }

    // noteValue is out of range for grid
    if (tooBig) {
      console.log(`tooBig: ${noteValue}`);
      while (noteValue > maxVal) {
        noteValue = noteValue - 12;
      }
      console.log(`tooBig - fixed: ${noteValue}`);
      return noteValueRowMap[noteValue];
    }

    if (tooSmall) {
      console.log(`tooSmall: ${noteValue}`);
      while (noteValue < maxVal) {
        noteValue = noteValue + 12;
      }
      console.log(`tooSmall - fixed: ${noteValue}`);
      return noteValueRowMap[noteValue];
    }
  }

  function getNoteCellMapper(beatsPerCol) {
    return function getCellSelectionsByNote(note) {
      let colsPerNote = note.duration / beatsPerCol;
      let gridStartingCol =
        Math.floor(note.startingBeat / beatsPerCol) +
        (note.startingBeat % beatsPerCol);
      let noteCells = [];

      if (note.value) {
        for (let i = gridStartingCol; i < gridStartingCol + colsPerNote; i++) {
          let row = getRowByNoteValue(note.value);
          console.info(`row ${row} noteValue ${note.value}`);
          let column = i;
          noteCells.push([column, row]);
        }
      }
      return noteCells;
    };
  }

  function getSelectionMatrix(notes, columns) {
    let selections = [];
    let beatsPerCol = Config.rhythmicUnit / columns;
    let noteMapper = getNoteCellMapper(beatsPerCol);
    let matrix = notes.map(noteMapper).flat();
    console.info(`getSelectionMatrix()`, matrix);
    return matrix;
  }

  // For now set up to handle first motif in array - add multi-motif grid overlay rendering later
  $: motif = motifs[0];
  $: columns = getMelodyColumns(motif);
  $: octaves = getMelodyOctaves(motif);
  $: rows = (octaveHigh - octaveLow + 1) * numberOfPitches;
  $: pitchSet = Utils.melody.getPitchSet(octaveLow, octaveHigh);
  $: cellDuration = getCellDuration(columns);
  $: gridViewBox = getGridViewBox(width, height, columns, rows);
  $: noteValueRowMap = getNoteValueRowMap(rows, pitchSet);
  $: selectionMatrix = getSelectionMatrix(motif.notes, columns);
</script>

<style>
  #note-grid {
    padding: 10px;
  }
  #grid-wrap {
    padding: 10px;
    border: 1px solid;
    border-radius: 5px;
    margin: 0 10px;
  }

  .grid-display {
    padding: 10px;
  }

  .input-wrap {
    flex-direction: column;
  }

  input,
  select {
    width: 40px;
  }
</style>

<svelte:window bind:innerWidth />
<section id="note-grid">

  <div id="grid-wrap">
    <Grid
      id="svg-grid"
      {width}
      {height}
      {rows}
      columns={columns + 1}
      viewBox={gridViewBox}
      labelSet={pitchSet}
      motifNotes={motif.notes}
      selections={selectionMatrix}
      {writable} />
  </div>
  <button class="reset" data-section="note-grid">reset</button>
  <div>each cell is {cellDuration}</div>
  <div class="grid-display">
    {#each gridDisplayFields as field}
      <Field {...field} on:inputValueChange on:displayAlert />
    {/each}
  </div>
</section>
