const express = require('express')
const bodyParser = require('body-parser')
const pub_routes = require('./routes/publications.js')

const app = express()
const port = process.env.PORT || 8080

app.set('view engine', 'ejs'); // required for Heroku
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.get('/', (req, res, next) => {
    res.send('CMPE138 Online Publication Management System');
})
app.use('/publications', pub_routes)

let server = app.listen(port, function () {  // listen to Heroku or local port...
    console.log('Running on port: ' + port)
})
// export for use in testing
module.exports = server
