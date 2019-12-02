<!--TODO: make this the abstract component class that is used by RandomizerForm and TransformerForm -->
<script>
    export let formId
    export let formTitle
    export let formInfo
    export let submitFunction
</script>
<section id={formId} class="show closed form">
        <details data-section={formId}>
            <summary>
                <h2><span class="icons dice">&#9861;</span>{formTitle}<span class="icons dice">&#9861;</span></h2>
                <p class="info">{formInfo}</p>
            </summary>
            <!--<section class="show selected-setting">
                <div class="input-wrap">
                    <label for="select-setting">Selected Setting</label>
                    <button id="select-setting-reset">clear</button>
                    <select id="select-setting" name="selected-setting" data-default="new unnamed" data-action="single"></select>
                </div>
            </section>-->
            <fieldset class="user-input">
                <legend>Settings</legend>
                <!--<button class="save-setting">save setting</button>-->
                <div>
                    <div class="input-wrap">
                        <label for="key">Key</label>
                        <select class="key" id="key" data-default="c" data-type="text" value="c"></select>
                    </div>
                    <div class="input-wrap">
                        <label for="mode">Mode</label>
                        <select class="mode" id="mode" data-default="chromatic" data-type="text" value="chromatic"></select>
                    </div>
                </div>
                <div class="input-group input-range" data-property="octave" data-type="object">
                    <div class="input-wrap"><label for="octave_low">Low Octave</label>
                        <input type="number" min="0" max="8" step="1" id="octave_low" data-key="low"
                               data-default="3" value="3" inputmode="numeric" pattern="[0-9]*" required
                        />
                    </div>
                    <div class="input-wrap"><label for="octave_high">High Octave</label>
                        <input type="number" min="0" max="8" step="1" id="octave_high" data-key="high"
                               data-default="5" value="5" inputmode="numeric" pattern="[0-9]*" required
                        />
                    </div>
                </div>
                <div class="input-group input-range" data-property="leap" data-type="object">
                    <div class="input-wrap"><label for="leap_min">Min Leap</label>
                        <input type="number" min="1" max="11" step="1" id="leap_min" data-key="min"
                               data-default="1" value="1" inputmode="numeric" pattern="[0-9]*" required
                        />
                    </div>
                    <div class="input-wrap"><label for="leap_max">Max Leap</label>
                        <input type="number" min="2" max="48" step="1" id="leap_max" data-key="max"
                               data-default="24" value="24" inputmode="numeric" pattern="[0-9]*" required
                        />
                    </div>
                </div>
                <div class="input-group" data-property="timeSignature" data-type="array">
                    <div class="input-wrap"><label for="timeSignature_beat">Time Signature Beat</label>
                        <select class="time_signature_beat" id="timeSignature_beat" data-type="number" data-index="0"
                                data-default="4" value="4"
                        >
                        </select>
                    </div>
                    <div class="input-wrap"><label for="timeSignature_unit">Time Signature Unit</label>
                        <select class="time_signature_unit" id="timeSignature_unit" data-type="number" data-index="1"
                                data-default="4" value="4"
                        >
                        </select>
                    </div>
                </div>
                <div>
                    <div class="input-wrap input-group" data-property="tempo" data-type="object">
                        <input type="hidden" class="tempo" id="tempo_type" data-default="bpm" value="bpm" data-type="text" data-key="type"/>
                        <label for="tempo_units">Tempo (bpm)</label>
                        <input type="number" class="tempo" min="60" max="240" step="1" id="tempo_units" data-key="units"
                               data-default="120" value="120" inputmode="numeric" pattern="[0-9]*" required
                        />
                    </div>
                    <div class="input-wrap input-group" data-property="length" data-type="object">
                        <input type="hidden" class="measures" id="length_type" data-default="measures" value="measures" data-type="text" data-key="type"/>
                        <label for="length_units">Measures</label>
                        <input type="number" min="1" max="8" step="1" class="measures" id="length_units" data-key="units"
                               data-default="2" value="2" inputmode="numeric" pattern="[0-9]*" required
                        />
                    </div>
                </div>
            </fieldset>
        </details>
        <div class="form-controls">
            <button class="section-toggle" data-section={formId}>open</button>
            <button class="reset" data-section={formId} disabled>reset</button>
            <button class="apply" id={formId} data-section={formId} on:click={submitFunction}>
                <span>apply</span>
            </button>
        </div>
    </section>

<style>
    fieldset {
        border-style: solid;
        padding: 0;
        margin: 0;
        width: 100%;
        flex-direction: column;
    }

    fieldset > div {
        padding: 5px 10px;
        flex-direction: column;
        border-bottom: 1px dotted var(--theme_color_10);
        width: 100%;
    }

    fieldset > div:last-of-type {
        border-bottom: none;
    }

    fieldset label, fieldset input {
        padding: 0 5px;
    }
</style>