import { writable } from "svelte/store";

function createMotifStore() {
  const { subscribe, set, update } = writable([]);
  return {
    subscribe,
    add: motif =>
      update(motifs => {
        let newMotifs = [];

        if (motifs.map(m => m.id).includes(motif.id)) {
          // motif already exists, so update it
          console.info(`motif ${motif.id} updated in store`);
          let idx = motifs.findIndex(m => m.id === motif.id);
          newMotifs = motifs.map((m, i) => (i === idx ? motif : m));
        } else {
          // store brand new motif
          newMotifs = [...motifs, motif];
        }

        return newMotifs;
      }),
    remove: motif => update(motifs => motifs.filter(m => m.id !== motif.id)),
    clear: () => set([])
  };
}
function createSettingsStore() {
  const { subscribe, set, update } = writable([]);
  return {
    subscribe,
    add: setting =>
      update(settings => {
        let newSettings = [];

        if (settings.map(s => s.id).includes(sotif.id)) {
          // setting already exists, so update it
          console.info(`setting ${setting.id} updated in store`);
          let idx = settings.findIndex(s => s.id === setting.id);
          newSettings = settings.map((s, i) => (i === idx ? setting : m));
        } else {
          // store brand new setting
          newSettings = [...settings, setting];
        }

        return newSettings;
      }),
    remove: setting =>
      update(settings => settings.filter(s => s.id !== setting.id)),
    clear: () => set([])
  };
}

export const motifStore = createMotifStore();
export const settingStore = createSettingsStore();
