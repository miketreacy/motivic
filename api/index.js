module.exports = (req, res) => {
    const response = `<html>
                        <head>
                            <meta
                                name="viewport"
                                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                            />
                            <link rel="preconnect" href="https://fonts.googleapis.com">
                            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                            <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet">
                            <style>
                                body {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    width: 100vw;
                                    margin: 0;
                                }
                                main {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    padding: 10px;
                                    max-width: 768px;
                                }                               
                                button.copy {
                                    position: absolute;
                                    right: 0;
                                    top: 0;
                                    background-color: white;
                                }
                                section {
                                    width: 100%;                                    
                                }
                                h1, h2 {
                                    font-family: Helvetica;
                                }
                                ul, ol {
                                    display: flex;
                                    flex-direction: column;
                                    padding-inline-start: 20px;
                                }
                                li {
                                    position: relative;                                    
                                }                            
                                pre {
                                    position: relative;
                                    display: flex;
                                    max-width: 85vw;
                                    flex-direction: column;
                                    color: #39ff14;
                                    background-color: black;                                   
                                    word-wrap: break-word;                            
                                    padding: .1rem .3rem .2rem;
                                    border-radius: .2rem;
                                    font-family: 'Roboto Mono', monospace;
                                    overflow: hidden;
                                    margin: 0;
                                }
                                button {
                                    cursor: copy;
                                    font-size: 9px;
                                }
                            </style>                            
                        </head>
                        <body>
                        <main>
                            <h1>Motivic API</h1>                            
                            <section>                                
                                    <h2>Documentation</h2>
                                    <ul>
                                        <li><a href="https://petstore.swagger.io/?url=https://motivic.io/openapi.yaml" target="_blank">Swagger (Open API Specification)</a></li>                                         
                                    </ul>                                                         
                            </section>
                            <section>
                                <h2>Try It Out</h2>                                
                                <p>Interact with the API from the command line using <a href="https://curl.se/" target="_blank">cURL</a> and <a href="https://stedolan.github.io/jq/" target="_blank">jq</a>. Generate a random melody, convert it to a WAV file, and listen to the results.</p>
                                <ol>
                                    <li>
                                        <p>Make a request to the <a href="https://github.com/miketreacy/motivic/blob/master/api/melody/random.js" target="_blank">random melody endpoint</a> and write the response to a JSON file.</p>
                                        <p>with default settings...</p>
                                        
                                        <pre>
                                            <button class="copy">&#128203;</button>                     
                                            <code>curl -X POST \\</code>
                                            <code>-H "Content-Type: application/json" \\</code>
                                            <code>-H "Cache-Control: no-cache" \\</code>
                                            <code>-d '{}' "https://motivic.io/api/melody/random" > my-motif.json</code>
                                        </pre>
                                        
                                        <p>...or with explicit custom user parameters</p>
                                        <pre>
                                            <button class="copy">&#128203;</button>
                                            <code>curl -X POST \\</code>
                                            <code>-H "Content-Type: application/json" \\</code>
                                            <code>-H "Cache-Control: no-cache" \\</code>
                                            <code>-d '{
        "key":"f#",
        "mode":"mixolydian",
        "octave": {
            "low": 3,
            "high": 5
        },
        "leap": {
            "min": 1,
            "max": 24
        },    
        "tempo": {
            "type": "bpm",
            "units": 140
        },
        "duration": {
            "min": 1,
            "max": 4
        },
        "length": {
            "type": "measures",
            "units": 1
        }</code>
                                        <code>}' "https://motivic.io/api/melody/random" > my-motif.json</code>
                                        </pre>
                                    </li>
                                    <li>
                                        <p>Parse the response to get the motif and save it to a variable</p>
                                        
                                        <pre>
                                            <button class="copy">&#128203;</button>
                                            <code>MOTIF=$(jq '.response' my-motif.json)</code>                        
                                        </pre>
                                    </li>
                                    <li>
                                        <p>Format the convertor API request body and save it to a variable</p>                    
                                        <pre>
                                            <button class="copy">&#128203;</button>
                                            <code>BODY='{"voice": "sawtooth", "motif": '$MOTIF'}'</code>                        
                                        </pre>
                                    </li>
                                    <li>
                                        <p>Send a request to the <a href="https://github.com/miketreacy/motivic/blob/master/api/convertor.go" target="_blank">Golang convertor endpoint</a> to generate a WAV audio file from the JSON motif. The response will be compressed in a .zip file.</p>
                                        
                                        <pre>
                                            <button class="copy">&#128203;</button>
                                            <code>curl -X POST \\</code>
                                            <code>-H "Accept: */*" \\</code>
                                            <code>-H "Accept-Encoding: gzip, deflate, br" \\</code>
                                            <code>-H "Content-Type: application/json" \\</code>
                                            <code>-H "Cache-Control: no-cache" \\</code>
                                            <code>-d "$BODY" "https://motivic.io/api/convertor" --output my-motif.zip</code>
                                        </pre>
                                    </li>                
                                    <li>
                                        <p>Unzip the file (MacOS)</p>
                                        
                                        <pre>
                                            <button class="copy">&#128203;</button>
                                            <code>unzip my-motif.zip</code>                        
                                        </pre>
                                    </li>
                                    <li>
                                        <p>Check your system volume. Make sure it is set to a healthy listening level!</p>                   
                                    </li>
                                    <li>
                                        <p>Play the WAV file (MacOS)</p>                    
                                        <pre>
                                            <button class="copy">&#128203;</button>
                                            <code>afplay my-motif.wav</code>                        
                                        </pre>
                                    </li>            
                                </ol>
                            </section>
        
        </main>
        <footer>
            <script>
                let copyButtons = [...document.querySelectorAll('button.copy')];
                let preEls = [...document.querySelectorAll('pre')];
                let selectedItemIndex = null;
                function onClick(e) {                                               
                    window.getSelection().removeAllRanges();
                    let range = document.createRange();
                    range.selectNode(e.target);
                    window.getSelection().addRange(range);      
                    document.execCommand('copy');
                }
                function onCopy(e) {                
                    e.preventDefault();                              
                    if (e.clipboardData) {
                        let buttonEl = e.target;                    
                        let preEl = buttonEl.closest('pre');
                        let codeEls = preEl.querySelectorAll('code');
                        let content = [...codeEls].map(el => el.textContent.trim()).join('\\n')
                        e.clipboardData.setData("text/plain", content);                    
                    }                                               
                }
                
                copyButtons.forEach(btn => btn.addEventListener('click', onClick));
                copyButtons.forEach(btn => btn.addEventListener('copy', onCopy));
            </script>
        </footer>
        </body>
        </html>`

    res.status(200).send(response)
}
