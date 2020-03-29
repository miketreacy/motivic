<script>
  import Utils from "./Utils.js";
  import GridRow from "./GridRow.svelte";
  export let id = "";
  export let width;
  export let height;
  export let rows;
  export let columns;
  export let labelSet;
  export let viewBox = "";
  export let motifNotes = [];
  export let selections = [[]];
  export let writable = true;

  let defId = "cell";
  let fontSize;
  let cellWidth;
  let cellHeight;
  let pitches = labelSet.reverse();

  const gridDisplayColumns = [8, 16, 32, 64];
  const gridDisplayWidth = 300;
  const gridDisplayHeight = 300;
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
  let innerWidth;

  function getCellDimension(dimension, units) {
    return dimension / units;
  }

  function getFontSize(height) {
    return height / 37.5;
  }

  $: cellWidth = getCellDimension(width, columns);
  $: cellHeight = getCellDimension(height, rows);
  $: fontSize = getFontSize(height);
</script>

<style>
  .grid {
  }
</style>

<svelte:window bind:innerWidth />

<svg class="grid" {id} {width} {height} {viewBox}>
  <defs>
    <rect id={defId} x="0" y="0" width={cellWidth} height={cellHeight} />
  </defs>
  <g {id}>
    {#each [...Array(rows).keys()].map(n => n + 1) as row, idx}
      <GridRow
        {defId}
        {row}
        {columns}
        {cellWidth}
        {cellHeight}
        note={pitches[idx]}
        motifNotes={motifNotes.filter(n => n.value === pitches[idx].value)}
        {selections}
        {fontSize} />
    {/each}
  </g>
</svg>
