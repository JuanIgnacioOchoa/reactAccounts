function updateLastUpdate(db){
    const timeStamp = (new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')).toString()
    console.log("CurrentTimeStamp", timeStamp)
    
    db.serialize(function() {
        
        
        var stmt
        stmt = db.prepare("UPDATE AccountsConfig set ValueCode = ? WHERE _id = 1 or _id = 2")
        stmt.run(timeStamp)
        stmt.finalize()
    }, (err) => {
        console.log('erro2', err)
        console.log('close')
        db.close()
    });
    
}

module.exports = {
    updateLastUpdate,
}