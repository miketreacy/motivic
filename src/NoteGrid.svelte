<section id="note-grid">
        <div id="svg_wrap">
            <button class="reset" data-section="note-grid">reset</button>
            <svg id="svg_label" width="20" height="300" viewBox="0 -11 20 300">
                <defs>
                    <text id="note_name" x="0" y="0" rx="2.5" ry="2.5" font-size="12"></text>
                </defs>
                <g id="grid_key"></g>
            </svg>
            <svg id="svg_grid" width="300" height="300" viewBox="0 0 300 300">
                <defs>
                    <rect id="cell" x="0" y="0" width="0" height="0"></rect>
                </defs>
                <g id="grid"></g>
            </svg>
        </div>
        <div class="grid-display">
            <div class="input-wrap"><label for="display_octave_low">Low Octave</label>
                <input
                        class="display_octave"
                        type="number"
                        min="0"
                        max="8"
                        step="1"
                        id="display_octave_low"
                        data-default="0"
                        value="3"
                        inputmode="numeric"
                        pattern="[0-9]*"
                />
            </div>
            <div class="input-wrap"><label for="display_octave_high">High Octave</label>
                <input class="display_octave" type="number" min="0" max="8" step="1" id="display_octave_high"
                       data-default="0" value="4"
                       inputmode="numeric" pattern="[0-9]*"
                />
            </div>
            <div class="input-wrap"><label for="display_columns">Display Columns</label>
                <select class="display_columns" id="display_columns"></select>
            </div>
        </div>
    </section>

<style>
    canvas {
        margin: 0;
        cursor: pointer;
    }

    svg .cell {
        fill: #eee;
        stroke: var(--theme_color_3);
        cursor: pointer;

        /*transition: fill 500ms ease 250ms;*/
    }

    svg .cell:hover {
        fill: orange;
    }

    svg .cell.selected {
        fill: green;
    }

    svg .cell.tie-candidate {
        fill: lightgreen;
    }

    svg .cell.tied {
        stroke-width: 0;
    }

    svg text, svg [href="#note_name"] {
        fill: var(--theme_color_3);
        stroke: var(--theme_color_3);
    }

    svg [data-key_color="white"] {
        fill: var(--theme_color_1);
        stroke: var(--theme_color_1);
    }
</style>