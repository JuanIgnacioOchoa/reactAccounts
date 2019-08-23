const { google } = require('googleapis')
const fs = require('fs');

module.exports = (app)  => {
    app.get('/upload/drive', function (req, res) {
        // not auth
        console.log('/upload/drive')

        if (!req.user) res.redirect('/auth/google')
        else {
            // auth user
            const sqlite3 = require('sqlite3')
            const db = new sqlite3.Database('./databases/Account-116307006854202796538.sqlite')
            // config google drive with client token
            
            ////AppDataFolder Drive

            //createFileAppData(drive, db)
            //listAppDataFolder(drive)
        }
    })
}