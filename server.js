
const express = require('express')

// initialize and configure express app...
const app = express()
app
    .set('view engine', 'ejs')                      // required for Heroku
    .use('/', (req, res) => {                       // set routes...
        res.send('nothing')
    })
    .listen(process.env.PORT || 8080, function() {  // listen to Heroku or local port...
        console.log('Running on port: ' + port)
    })

// export for use in testing
module.exports = app
