const { google } = require('googleapis')
const fs = require('fs');
const sqlite3 = require('sqlite3')
const dbName = './databases/Account-116307006854202796538.sqlite'
const dbMan = require('./../DataBase/db')
async function createAllFileAppData(accessToken){
    console.log('createAllFileAppData')
    const oauth2Client = new google.auth.OAuth2()
            oauth2Client.setCredentials({
                'access_token': accessToken
            });

    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client
    });
    const db = new sqlite3.Database(dbName)
    var c = 1
    
    const promiseTables = new Promise((resolve, reject) => {
        db.all(`select name from sqlite_master where type='table' 
         and name like 'Accounts%' order by name desc`, 
            (err, rows) => {
                if(err == null)
                    //console.log('aaaaaaaaaa', rows)
                    resolve(rows)
                return reject(err)
            })
    })
    const tables = await promiseTables.catch(err => {return reject(err)})
    const promisesData = []
    tables.forEach(t => {
        promisesData.push( new Promise((resolve, reject) => {
            console.log('name table', t.name)
            db.all("SELECT * FROM " + t.name, (err, rows) => {
                if(err == null){
                    resolve(rows)
                } else {
                    return reject(err)
                }
            })
        }))
    })
    //console.log('d', promisesData)
    const data = await Promise.all(promisesData)
    return new Promise(async (resolve, reject) => {
        var c = 0
        await new Promise(async (resolve, reject) => 
        {    
            await asyncForEach(data, async d => {
                await sleep()
                const name = tables[c].name + "tmp" + Math.floor(Math.random() * Math.floor(1000000)) + '.json'
                
                const json = JSON.stringify(d)
                await fs.writeFileSync('./../../dbjson/' + name, json)
                //.catch(err => {return reject(err)})
                var fileMetadata = {
                    'name': tables[c].name,
                    'parents': ['appDataFolder']
                };
                var media = {
                    mimeType: 'application/json',
                    body: fs.createReadStream('./../../dbjson/' + name)
                };
                const x = await createDriveFile(drive, fileMetadata, tables[c].name, media)
                .catch(err => {
                    return reject(err)
                })
                c ++ 
                await fs.unlinkSync('./../../dbjson/' + name)
            })
            resolve('Created C')
        })
        resolve('Created')
    })
}

async function createDriveFile(drive, fileMetadata, name, media){
    console.log('createDriveFile, ')
    await sleep()
    const promise = new Promise((resolve, reject) => {
        drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function (err, file) {
            if (err) {
            // Handle error
            //.error('error', err);
                return reject(err)
            } else {
                //console.log('c', c)
                console.log('Folder Name: ', name)
                //console.log('Folder Id:', file.data.id);
                //c = c + 1
                resolve('Create F')
            }
        });
    })
    //const result = await promise
    
    return promise
}
function listAppDataFolder(accessToken){
    console.log('listAppDataFolder')
    const oauth2Client = new google.auth.OAuth2()
            oauth2Client.setCredentials({
                'access_token': accessToken
            });

    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client
    });
    drive.files.list({
        spaces: 'appDataFolder',
        fields: 'nextPageToken, files(id, name)',
        pageSize: 150,
      }, function (err, res) {
        if (err) {
            // Handle error
            //console.error(err);
        } else {
            //console.log("size: ", res.data.files.length)
            res.data.files.forEach(function (file) {
                console.log('Found file:', file.name, 'Id: ', file.id);
                //deleteAppDataFolder(drive, file.id)
                //getAppDataFolder(drive, file.id, file.name)
            });
        }
      });
}
async function getAppDataFolderID(drive, id){
    console.log("getAppDataFolderId: ", id)
    const promise = new Promise((resolve, reject) => {
        drive.files.get({
            fileId: id,
            mimeType: "json", //also tried to leave this line
            alt: "media"
        }, function(err, res) {
            if (err) {
                // Handle error
                console.error(err);
                return reject(err)
            } else {
                //console.log('holi json 2', res)
                resolve(res.data)
            }
        })
    })
    return promise
}
async function getAppDataFolderName(accessToken, name){
    console.log('getAppDataFolderName: ', name)
    const oauth2Client = new google.auth.OAuth2()
            oauth2Client.setCredentials({
                'access_token': accessToken
            });

    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client
    });
    const promise = new Promise((resolve, reject) => {
        drive.files.list({
            spaces: 'appDataFolder',
            fields: 'nextPageToken, files(id, name)',
            pageSize: 1,
            q: "name='" + name + "'",
        }, function(err, res) {
            if (err) {
                // Handle error
                //console.error(err);
                reject(err)
              } else {
                    console.log("File", res.data.files.length) 
                    //if(true){
                    if(res.data.files.length <= 0){
                        deleteAllAppDataFolder(accessToken)
                        .then(res => {
                            createAllFileAppData(accessToken)
                            .then( (r) => {
                                resolve('created')
                            })
                            .catch(err => {
                                reject(err)
                            })
                        }).catch(err => {
                            reject(err)
                        })
                    } else {
                        getAppDataFolderID(drive, res.data.files[0].id)
                        .then(res => {
                            console.log('holi json 1', res) 
                            resolve(res)
                        })
                        .catch(err => {
                            reject(err)
                        })
                    }
              }
        })
    })
    return promise
}
async function replaceDrivewithLocal(accessToken){
    console.log('replaceDrivewithLocal: ')
    const oauth2Client = new google.auth.OAuth2()
            oauth2Client.setCredentials({
                'access_token': accessToken
            });

    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client
    });
    const promise = new Promise((resolve, reject) => {
        drive.files.list({
            spaces: 'appDataFolder',
            fields: 'nextPageToken, files(id, name)',
            pageSize: 15,
        }, function(err, res) {
            if (err) {
                // Handle error
                //console.error(err);
                reject(err)
            } else {
                res.data.files.forEach(function (file) {
                    sleep().then(res => {

                    })
                    deleteAppDataFolder(drive, file.id).catch(err => {
                        reject('errorbbb', err)
                    })
                });
                resolve('finish')
            }
        })
    })
    await promise
    const promise2 = new Promise((resolve, reject) => {
        createAllFileAppData(accessToken)
        .then((r) => {
            resolve('created')
        })
        .catch( err => {
            return reject(err)
        })
    })
    return promise2
}
async function deleteAllAppDataFolder(accessToken){
    //return Promise((resolve, reject) => {
        console.log('deleteAllAppData')
        const oauth2Client = new google.auth.OAuth2()
                oauth2Client.setCredentials({
                    'access_token': accessToken
                });
    
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        const promise = new Promise( (resolve, reject) => {
            drive.files.list({
                spaces: 'appDataFolder',
                fields: 'nextPageToken, files(id, name)',
                pageSize: 15,
              }, async function (err, res) {
                if (err) {
                    // Handle error
                    reject('error: ', err)
                } else {
                    //console.log("size: ", res.data.files.length)
                    res.data.files.forEach(function (file) {
                        deleteAppDataFolder(drive, file.id).catch(err => {
                            reject('errorbbb', err)
                        })
                    });
                    resolve('finish')
                }
              });
        })
        return promise
    //})
}
async function deleteAppDataFolder(drive, id){
    console.log('deleteAppDataFolder')
    await sleep()
    const promise = new Promise((resolve, reject) => {
        drive.files.delete({
            fileId: id,
        }, function(err, res) {
            if (err) {
                // Handle error
                return reject('errorkkkk: ' + err)
              } else {
                resolve('true')
              }
        })
    })
    //console.log('3', id)
    await promise
    await sleep(); //TODO : 10 queries per second
    //console.log('finish 4', result)
    return
}
async function reemplazarAllBDConFriveFiles(db, accessToken){
    //dbMan.create()
    //const db = new sqlite3.Database('./databases/Account-testtttt.sqlite')
    //return
    console.log('reemplazarAllBDConFriveFiles')
    const oauth2Client = new google.auth.OAuth2()
            oauth2Client.setCredentials({
                'access_token': accessToken
            });

    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client
    });
    const d = await drive.files.list({
        spaces: 'appDataFolder',
        fields: 'nextPageToken, files(id, name)',
        pageSize: 15,
    })
    d.data.files.forEach(f => {
        switch(f.name){
            case('AccountsMoneda'):
                f.order = 20
                break
            case('AccountsTrips'):
                f.order = 30
                break
            case('AccountsCambioMoneda'):
                f.order = 40
                break
            case('AccountsTiposCuentas'):
                f.order = 50
                break
            case('AccountsTotales'):
                f.order = 0
                break
            case('AccountsMotivo'):
                f.order = 60
                break
            case('AccountsPersonas'):
                f.order = 70
                break
            case('AccountsPrestamos'):
                f.order = 90
                break
            case('AccountsPrestamosDetalle'):
                f.order = 100
                break
            case('AccountsConfig'):
                f.order = 110
                break
            case('AccountsMovimiento'):
                f.order = 120 
                break
        }
    })
    var sortByProperty = function (property) {
        return function (x, y) {
            return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
        };
    };
    d.data.files.sort(sortByProperty('order'))
    //console.log('d', d.data.files)
    var data = []
    await asyncForEach(d.data.files, async f => {
        await sleep()
        const tmp = await (getAppDataFolderID(drive, f.id))
        data.push(tmp)
    })

    deleteTables(db)
    console.log('delete continue')
    const queries = []
    for(i = 0; i < d.data.files.length; i++){
        const name = d.data.files[i].name

        console.log('table: ', name)
        data[i].forEach(element =>{
            var keys = ""
            var values = ""
            for(var k in element){
                if(element[k] == null){
                    values += 'null,' 
                } else {
                    values += "'"+element[k]+"',"
                }
                keys += k +','
            }
            values = values.substring(0, values.length-1)
            keys = keys.substring(0, keys.length-1)
            queries.push(`INSERT INTO ${name} (${keys}) VALUES(${values})`)
        })
    }  
    
    console.log('serialize')
    
    db.serialize(function() {
        var stmt
        for(i = 0; i < queries.length; i ++){
        //queries.forEach((q) => {
            console.log('1a, ', queries[i])
            stmt = db.prepare(queries[i])
            var a = stmt.run()
            stmt.finalize()
        //})
        }
    }, (err) => {
            console.log('erro2', err)
            db.close()
    })
    db.close()
    console.log("a1")
    
}
function deleteTables(db){
    const query = []
    query.push('delete from AccountsMovimiento')
    query.push('delete from AccountsTiposCuentas')
    query.push('delete from AccountsConfig')
    query.push('delete from AccountsPrestamosDetalle')
    query.push('delete from AccountsPrestamos')
    query.push('delete from AccountsPersonas')
    query.push('delete from AccountsMotivo')
    query.push('delete from AccountsCambioMoneda')
    query.push('delete from AccountsTrips')
    query.push('delete from AccountsMoneda')
    query.push('delete from AccountsTotales')
    //return new Promise((resolve, reject), 
    //db.serialize(function() {
    db.serialize(function() {
        var stmt
        query.forEach((q) => {
            console.log('q', q)
            stmt = db.prepare(q)
            stmt.run()
            stmt.finalize()
        })
        }, (err) => {
            console.log('erro2', err)
            console.log('close')
            db.close()
        });
    //})
    //)
}
function sleep() {
    return new Promise(resolve => setTimeout(resolve, 115));
}
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    createAllFileAppData,
    listAppDataFolder,
    getAppDataFolderID,
    deleteAllAppDataFolder,
    deleteAppDataFolder,
    getAppDataFolderName,
    reemplazarAllBDConFriveFiles,
    replaceDrivewithLocal,
}