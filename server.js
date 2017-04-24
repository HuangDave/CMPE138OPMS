
const    express = require('express')
const bodyParser = require('body-parser')
const pub_routes = require('./routes/publications.js')

// initialize and configure express app...
const app = express()

// define port for testing
// process.env.PORT lets the port be set by Heroku...
const port = process.env.PORT || 8080

app
    .set('view engine', 'ejs')                      // required for Heroku

    .use(bodyParser.urlencoded({extended: false })) // set configurations...
    .use(bodyParser.json())

    .use('/publications', pub_routes)

    .listen(port, function() {  // listen to Heroku or local port...
        console.log('Running on port: ' + port)
    })

// export for use in testing
module.exports = app
