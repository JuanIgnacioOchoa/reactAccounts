const passport = require('passport');
const drive = require('./../services/drive')
const sqlite3 = require('sqlite3')
const dbName = './databases/Account-116307006854202796538.sqlite'
//export the routes
module.exports = (app) => {
    
    app.get('/auth/google', passport.authenticate('google', {
            scope: ['profile', 'email',
            'https://www.googleapis.com/auth/drive.appdata']
        })
    )

    app.get(
        '/auth/google/callback', 
        passport.authenticate('google'),
        (req, res) => {
            
            drive.getAppDataFolderName(req.user.accessToken, 'AccountsConfig.json')
            .then(response => {
                console.log('holi json', response)
                if(response != 'created'){
                    const db = new sqlite3.Database(dbName)
                    const a = db.all('SELECT * FROM AccountsConfig', (err, rows) => {
                        if(err == null){
                            console.log('ro', rows.length) 
                            //console.log('re', response[1])
                            if(rows.length <= 0){ 
                                drive.reemplazarAllBDConFriveFiles(db, req.user.accessToken)
                                .then(response => {
                                    console.log('holi success', response)
                                    res.redirect('/')
                                })
                                .catch(err => {
                                    console.log('error1', err)
                                    res.redirect('/error')
                                })
                            } else {
                                const localLastUpdate = rows[0].ValueCode
                                const localLastSync = rows[1].ValueCode
                                const driveLastUpdate = response[0].ValueCode
                                const driveLastSync = response[1].ValueCode
                                console.log('Updated: ', localLastUpdate, driveLastUpdate, localLastUpdate == driveLastUpdate)
                                console.log('Sync:  :', localLastSync, driveLastSync, localLastSync == driveLastSync)
                                
                                //if(true){
                                if(false){
                                //if(localLastUpdate < driveLastUpdate){
                                    //TODO reemplazar bd local con la del drive PROBADO
                                    drive.reemplazarAllBDConFriveFiles(db, req.user.accessToken)
                                    .then(response => {
                                        console.log('holi success', response)
                                        res.redirect('/')
                                    })
                                    .catch(err => {
                                        console.log('error1', err)
                                        res.redirect('/error')
                                    })

                                } else if(false){
                                //} else if(localLastUpdate === driveLastUpdate){
                                    res.redirect('/')
                                } else {
                                    //TODO actualizar bd de drive con la local
                                    drive.replaceDrivewithLocal(req.user.accessToken)
                                    .then( response => {
                                        console.log('holi2 success', response)
                                        res.redirect('/')
                                    }).catch(err => {
                                        console.log('error1', err)
                                        res.redirect('/error')
                                    })
                                }
                                
                            }
                        } else {
                            //console.log('er', err)
                            res.redirect('/error', 404)
                        }
                    })
                } else {
                    res.redirect('/')
                }
                
            })
            .catch(err => {
                console.log('holi json err: ', err)
                res.redirect('/error', 404)
            })
        }
    )

    app.get('/api/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

    app.get('/api/current_user', (req, res) => {
        console.log('current user', req.user)
        res.send(req.user) 
    })
};