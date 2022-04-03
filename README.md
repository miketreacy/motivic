# Motivic

_tools for composers_

This app allows users to do the following:

1. Generate a monophonic melody, or motif one of three ways
    - Creating a random motif with the randomizer tool
    - Importing a MIDI or JSON file (must be monophonic!)
2. Transform that motif into a new motif using concepts from baroque composition.
3. Layer multiple motifs to create unique melodic counterpoint.
4. Export that new motif as a MIDI, JSON, or WAV file.

Motivic uses the Web Audio API to generate all sounds.

## Dependencies:

-   [svelte 3](https://github.com/sveltejs/svelte) front-end framework.
-   [jsmidgen](https://github.com/dingram/jsmidgen) for encoding MIDI files.
-   [midi-parser-js](https://github.com/colxi/midi-parser-js) for parsing MIDI files.

## Running Locally

```bash
# FRONT END APP
# install dependencies
npm install

# start local dev server with file watching and hot reloading at localhost:5000
npm run dev

# create prod build
npm run build

# run prod build
npm run start

# BACK END API
# runs serverless apis with file-watchers listening locally at localhost:3000
vercel login && vercel dev --debug

# FULL STACK
# rebuild full app
npm run build && vercel login && vercel dev --debug
```
