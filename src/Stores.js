import { writable } from 'svelte/store';

function updateGlobalUserData(items, type) {
    let initGlobal = window.MOTIVIC || { user: { motifs: [], settings: [] } };
    initGlobal.user[type] = items;
    window.MOTIVIC = initGlobal;
}

function createMotifStore() {
    const { subscribe, set, update } = writable([]);
    return {
        subscribe,
        add: (motif) => update(motifs => {
            console.info(`motif ${motif.id} added to store`);
            let newMotifs = [...motifs, motif];
            updateGlobalUserData(newMotifs, 'motifs');
            return newMotifs;
        }),
        remove: (motif) => update(motifs => motifs.filter(m => m.id !== motif.id)),
        clear: () => set([])
    };
}
function createSettingsStore() {
    const { subscribe, set, update } = writable([]);
    return {
        subscribe,
        add: (setting) => update(settings => {
            console.info(`setting ${setting.id} added to store`);
            let newSettings = [...settings, setting];
            updateGlobalUserData(newSettings, 'settings');
            return newSettings;
        }),
        remove: (setting) => update(settings => settings.filter(s => s.id !== setting.id)),
        clear: () => set([])
    };
}

export const motifStore = createMotifStore();
export const settingStore = createSettingsStore();