<section id="transformer" class="show closed form">
        <details data-section="transformer">
            <summary>
                <h2><span class="icons">&#10226;</span>Transformer<span class="icons">&#10227;</span></h2>
                <p class="info">applies transformations to an existing melody to produce counterpoint</p>
            </summary>
            <!--<section class="show selected-setting">
                    <div class="input-wrap">
                        <label for="select-setting">Selected Setting</label>
                        <button id="select-setting-reset">clear</button>
                        <select id="select-setting" name="selected-setting" data-default="new unnamed" data-action="single"></select>
                    </div>
                </section>-->
            <fieldset class="user-input input-required">
                <legend>Settings</legend>
                <button class="reset" data-section="transformer" disabled>reset</button>
                <!--<button class="save-setting">save setting</button>-->
                <div>
                    <div class="input-wrap"><label for="transpose">Transpose</label>
                        <input
                                type="number"
                                data-default="0"
                                value="0"
                                min="-11"
                                max="11"
                                step="1"
                                id="transpose"
                                class="transpose"
                        />
                    </div>
                    <div class="input-wrap">
                        <label for="invert">Invert</label>
                        <input
                            type="checkbox"
                            id="invert"
                            class="invert"
                            data-type="boolean"
                            data-default="false"
                            value="off"
                        />
                    </div>
                </div>
                <div class="input-group" data-property="reverse">
                    <div class="input-wrap">
                        <label for="reverse_pitch">Reverse Pitches</label>
                        <input
                                type="checkbox"
                                name="reverse"
                                id="reverse_pitch"
                                class="reverse_pitch"
                                data-type="boolean"
                                data-index="1"
                                data-default="false"
                                value="off"
                        />
                    </div>
                    <div class="input-wrap">
                        <label for="reverse_rhythm">Reverse Durations</label>
                        <input
                                type="checkbox"
                                name="reverse"
                                id="reverse_rhythm"
                                class="reverse_rhythm"
                                data-type="boolean"
                                data-index="0"
                                data-default="false"
                                value="off"
                        />
                    </div>
                </div>
                <div>
                    <div class="input-wrap"><label for="augment">Augment</label>
                        <input
                                type="number"
                                id="augment"
                                class="augment"
                                data-default="0"
                                value="0"
                                min="0"
                                max="4"
                                step="2"
                                inputmode="numeric"
                                pattern="[0-9]*"
                        />
                    </div>
                    <div class="input-wrap"><label for="diminish">Diminish</label>
                        <input
                            type="number"
                            id="diminish"
                            class="diminish"
                            data-default="0"
                            value="0"
                            min="0"
                            max="4"
                            step="2"
                            inputmode="numeric"
                            pattern="[0-9]*"
                        />
                    </div>
                    <div class="input-wrap"><label for="stagger">Stagger</label>
                        <input
                            type="number"
                            id="stagger"
                            class="stagger"
                            data-default="0"
                            value="0"
                            min="0"
                            max="64"
                            step="1"
                            inputmode="numeric"
                            pattern="[0-9]*"
                        />
                    </div>
                </div>
                <div>
                    <div class="input-wrap name"><label for="variation_name">name</label>
                        <input
                            type="text"
                            id="variation_name"
                            max="16"
                            class="name"
                            data-default=""
                        />
                    </div>
                </div>
            </fieldset>
        </details>
        <div class="form-controls">
            <button class="section-toggle" data-section="transformer">open</button>
            <button class="reset" data-section="transformer" disabled>reset</button>
            <button class="apply transform" id="transform" data-section="transformer" disabled><span>apply</span></button>
        </div>
    </section>