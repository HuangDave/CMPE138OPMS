
const express = require('express')

// initialize express app...
const app = express()
// process.env.PORT lets the port be set by Heroku...
const port = process.env.PORT || 8080

// configure express...
app

    // required for Heroku
    .set('view engine', 'ejs')

    // set routes...
    .use('/', (req, res) => {
        res.send('nothing')
    })

    // listen to Heroku or local port...
    .listen(port, function() {
        console.log('Running on port: ' + port)
    })

// export for use in testing
module.exports = app
