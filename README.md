# Motivic

_tools for composers_

This app allows users to do the following:

1. Generate a monophonic melody, or `motif` one of three ways:
    - Creating a random motif with the randomizer tool
    - Importing a MIDI file (must be monophonic!)
    - Importing a JSON file (must be monophonic!)
2. Transform that motif into a new motif using concepts from baroque composition.
3. Layer multiple motifs to create unique melodic counterpoint.
4. Export that new motif as a MIDI, JSON, or WAV file.

Motivic uses the Web Audio API to generate all sounds.

## SERVICES

### ACTIVE

-   [motivic web app](https://motivic.io)
    -   SPA built with [Svelte 3](https://svelte.dev/)
    -   consumes motivic API
    -   future:
        -   could be configured into a PWA
-   [motivic API](https://motivic.io/api)
    -   [API curl test steps here](https://motivic.io/api)
    -   exposes core business logic of Motivic
    -   REST API hosted as polyglot serverless funtions:
        -   `/api/melody/random`:
            -   Node.js service generates random motifs based on user input.
        -   `/api/melody/transform`:
            -   Node.js service applies musical transformations to motifs based on user input.
        -   `/api/convertor`:
            -   Golang service converts JSON and MIDI motifs to WAV audio files.
    -   future:
        -   core functionality will expand greatly
        -   will service multiple public and private clients

### INACTIVE

-   [motivic_api_crud](https://github.com/miketreacy/motivic_api_crud)
    -   REST API
    -   CRUD service against hosted MongoDB instance
    -   currently hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    -   future:
        -   will be re-animated if and when I need to model user accounts and persist user data remotely

## REPOSITORY

The SPA front-end app code and the REST API code live together in one [monorepo](https://github.com/miketreacy/motivic).

## DEPENDENCIES:

-   Web App:
    -   [svelte 3](https://github.com/sveltejs/svelte) front-end framework.
    -   [jsmidgen](https://github.com/dingram/jsmidgen) for encoding MIDI files.
    -   [midi-parser-js](https://github.com/colxi/midi-parser-js) for parsing MIDI files.
-   API:
    -   [go-audio](https://github.com/go-audio) audio file utility packages for converting music data to audio files.
        -   [audio](https://github.com/go-audio/audio)
        -   [generator](https://github.com/go-audio/generator)
        -   [midi](https://github.com/go-audio/midi)
        -   [wav](https://github.com/go-audio/wav)
        -   [aiff](https://github.com/go-audio/aiff)

## VERCEL HOSTING

Motivic is hosted as a serverless monorepo app on cloud hosting platform [Vercel](https://vercel.com/).
Changes can be made via the [Vercel dashboard](https://vercel.com/miketreacy/motivic).

### VERCEL SERVERLESS MONOREPO HOSTING SCHEME

-   The front-end Svelte SPA is served from `public/index.html`.
-   REST API hosting scheme:
    -   Every directory in the `./api` directory represents a url path
    -   Every file in the `./api` directory represents an endpoint that runs as its own serverless function:
        -   [`/api/melody/random.js`](https://github.com/miketreacy/motivic/blob/master/api/melody/random.js) handles requests to `https://motivic.io/api/melody/random`
        -   [`/api/melody/transform.js`](https://github.com/miketreacy/motivic/blob/master/api/melody/transform.js) handles requests to `https://motivic.io/api/melody/transform`
        -   [`/api/convertor.go`](https://github.com/miketreacy/motivic/blob/master/api/convertor.go) handles requests to `https://motivic.io/api/convertor`

### CI/CD FLOW

Deployment works via a [Vercel integration with the GitHub repository](https://vercel.com/docs/concepts/git).

#### To Deploy To Production:

1. Push branch to `master`
1. Build stage
    1. Website assets are built
    1. Each API endpoint file is deployed to its own serverless function
1. Deploy stage
    1. Website is deployed
    1. Each API endpoint is spun up at request time

## RUNNING LOCALLY

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
