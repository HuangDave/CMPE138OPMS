const sqlite3 = require('sqlite3').verbose(),
           db = new sqlite3.Database('./database.db')

db.run('PRAGMA foreign_keys = ON')  // enable foreign keys for ON DELETE CASCADE

module.exports = db
