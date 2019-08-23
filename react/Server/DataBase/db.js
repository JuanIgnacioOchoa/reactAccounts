const sqlite3 = require('sqlite3')
const dbName = './databases/Account-testtttt.sqlite'
const createQueries = require('./Creates')
function create(){
    const tmpDB = new sqlite3.Database(dbName)
    tmpDB.serialize(() => {
        //tmpDB.run(createQueries.sqlite_sequence)
        //tmpDB.run(createQueries.android_metadata)
        tmpDB.run(createQueries.Moneda)
        tmpDB.run(createQueries.Trips)
        tmpDB.run(createQueries.CambioMoneda)
        tmpDB.run(createQueries.Totales)
        tmpDB.run(createQueries.Motivo)
        tmpDB.run(createQueries.Personas)
        tmpDB.run(createQueries.Prestamos)
        tmpDB.run(createQueries.PrestamosDetalle)
        tmpDB.run(createQueries.Config)
        tmpDB.run(createQueries.TiposCuentas)
        tmpDB.run(createQueries.Movimiento)
    })
    
}

module.exports = {
    create,
}