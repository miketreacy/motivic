module.exports = (req, res) => {
    const apiRouteMap = {
        '/api/melody/random': 'POST',
        '/api/melody/transform': 'POST',
    }
    const operations = Object.keys(apiRouteMap)
        .map((k) => `<div>${apiRouteMap[k]} <a href="${k}">${k}</a></div>`)
        .join('')
    const message = `Welcome to the Motivic API! <div>available operations:${operations}</div>`
    const response = `<body
        style="display: flex; flex-direction: column; align-items: center;">${message}
        </body>`

    res.status(200).send(response)
}
