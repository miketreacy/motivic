<script>
    export let type = '';
    export let id = '';
    export let dataKey = '';
    export let label = '';
    export let defaultValue = '';
    export let required = true;
</script>
<div class="input-wrap">
    <label for={id}>{label}</label>
    <input
        type={type}
        id={id}
        data-key={dataKey}
        data-default={defaultValue}
        value={defaultValue}
        required={required}

        min="0"
        max="8"
        step="1"
        inputmode="numeric"
        pattern="[0-9]*"
    />
</div>

<style>
    input {
        cursor: pointer;
        color: var(--theme_color_2);
        font-size: var(--theme_font_size_2);
        background-color: var(--theme_color_1);
        border: none;
        border-radius: 5px;
        min-height: 30px;
        outline: none;
    }

    input:focus {
        outline: none;
    }

    .input-wrap {
        flex-direction: row;
        padding: 0;
        width: 100%;
        position: relative;
        height: 40px;
        justify-content: space-between;
    }

    .input-wrap label {
        padding: 5px;
    }

    .input-wrap input {
        padding: 5px;
        height: 30px;
        border: 1px solid var(--theme_color_10);
        width: 40%;
        margin: 0;
    }
    .input-wrap input[type="checkbox"] {
        width: 40px;
    }

    input[type="file"] {
        width: auto;
        height: auto;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .input-wrap.overlay {
        position: absolute;
        left: 170px;
        width: 80px;
    }

    .input-wrap.name {
        flex-direction: column;
    }

    .input-wrap.name input {
        width: auto;
        text-align: center;
    }

    .input {
        flex: 1 1 0;
    }

    .input label {
        flex: 100% 1 0;
    }

    .input select, .input input, .input label {
        font-size: var(--theme_font_size_1);
    }

</style>