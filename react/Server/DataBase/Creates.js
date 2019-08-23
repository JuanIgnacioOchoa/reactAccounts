exports.Config = `CREATE TABLE "AccountsConfig" 
("_id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , 
"KeyCode" DATETIME DEFAULT CURRENT_TIMESTAMP , 
"ValueCode"  DATETIME DEFAULT CURRENT_TIMESTAMP)`
exports.CambioMoneda = `CREATE TABLE "AccountsCambioMoneda" ("_id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "IdMoneda1" INTEGER NOT NULL , "IdMoneda2" INTEGER NOT NULL , "Tipo_de_cambio" DOUBLE NOT NULL  DEFAULT 0.0)`
exports.Moneda = `CREATE TABLE "AccountsMoneda" ("_id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "Moneda" VARCHAR(5) NOT NULL  UNIQUE , "Active" INTEGER NOT NULL  DEFAULT 1)`
exports.Motivo = `CREATE TABLE "AccountsMotivo" ("_id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "Motivo" VARCHAR(50) NOT NULL  UNIQUE , "Active" BOOL NOT NULL  DEFAULT 1)`
exports.Movimiento = `CREATE TABLE "AccountsMovimiento" ( 
	'_id' INTEGER NOT NULL, 
	'Cantidad' DOUBLE NOT NULL, 
	'Fecha' DATETIME NOT NULL DEFAULT CURRENT_DATE, 
	'IdTotales' INTEGER NOT NULL, 
	'IdMotivo' INTEGER NOT NULL, 
	'IdMoneda' INTEGER NOT NULL, 
	'Cambio' DOUEBLE, 
	'Traspaso' INTEGER, 
	'comment' varchar ( 255 ), 
	'IdViaje' INTEGER,
	PRIMARY KEY('_id'), 
	FOREIGN KEY('IdMoneda') REFERENCES 'AccountsMoneda'('_id'), 
	FOREIGN KEY('IdTotales') REFERENCES 'AccountsTotales'('_id'), 
	FOREIGN KEY('Traspaso') REFERENCES 'AccountsTotales'('_id'), 
	FOREIGN KEY('IdMotivo') REFERENCES 'AccountsMotivo'('_id')
    FOREIGN KEY('IdViaje') REFERENCES 'AccountsTrips'('_id'))`
exports.Personas = `CREATE TABLE "AccountsPersonas" 
    ("_id" INTEGER NOT NULL, 
    "Nombre" varchar (50), 
    "Active" BOOL not null DEFAULT 1, 
    PRIMARY KEY("_id"))`
exports.Prestamos = `CREATE TABLE "AccountsPrestamos" 
    ( "_id" INTEGER NOT NULL, 
    "Cantidad" DOUBLE NOT NULL, 
    "Fecha" DATETIME NOT NULL DEFAULT CURRENT_DATE, 
    "IdTotales" INTEGER NOT NULL, 
    "IdMoneda" INTEGER NOT NULL, 
    "Comment" varchar ( 255 ), 
    "IdPersona" INTEGER NOT NULL,
    "Cambio" DOUBLE,
    "IdMovimiento" INTEGER,
    "Cerrada" BOOL not null DEFAULT 0,
    PRIMARY KEY("_id"), 
    FOREIGN KEY("IdMoneda") REFERENCES "AccountsMoneda"("_id"),
    FOREIGN KEY("IdMovimiento") REFERENCES "AccountsMovimiento"("_id"), 
    FOREIGN KEY("IdTotales") REFERENCES "AccountsTotales"("_id"), 
    FOREIGN KEY("IdPersona") REFERENCES "AccountsPersonas"("_id"))`
exports.PrestamosDetalle = `CREATE TABLE "AccountsPrestamosDetalle" 
    ( "_id" INTEGER NOT NULL, 
    "Cantidad" DOUBLE NOT NULL, 
    "Fecha" DATETIME NOT NULL DEFAULT CURRENT_DATE, 
    "IdTotales" INTEGER NOT NULL, 
    "IdMoneda" INTEGER NOT NULL,
    "Cambio" DOUBLE, 
    "IdPrestamo" varchar ( 255 ), 
    PRIMARY KEY("_id"), 
    FOREIGN KEY("IdMoneda") REFERENCES "AccountsMoneda"("_id"), 
    FOREIGN KEY("IdTotales") REFERENCES "AccountsTotales"("_id"), 
    FOREIGN KEY("IdPrestamo") REFERENCES "AccountsPrestamos"("_id"))`
exports.TiposCuentas = `CREATE TABLE "AccountsTiposCuentas" ("_id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "Tipo" VARCHAR NOT NULL )`
exports.Totales = `CREATE TABLE "AccountsTotales" ("_id" INTEGER PRIMARY KEY  NOT NULL ,"Cuenta" VARCHAR(20) NOT NULL ,"CantidadInicial" DOUBLE NOT NULL ,"CurrentCantidad" DOUBLE NOT NULL ,"IdMoneda" INTEGER NOT NULL  DEFAULT (1) ,"Activa" BOOL NOT NULL  DEFAULT (1) ,"Tipo" INTEGER DEFAULT (1) )`
exports.Trips = `CREATE TABLE "AccountsTrips" ( 
    "_id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL , 
    "Nombre" varchar ( 50 ) NOT NULL , 
    "Descripcion" varchar ( 250 ) ,
    "FechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_DATE , 
    "FechaCierre" DATETIME, 
    "FechaInicio" DATETIME, 
    "FechaFin" DATETIME, 
    "Total" DOUBLE NOT NULL DEFAULT 0.0,
	"IdMoneda" INTEGER NOT NULL,
    FOREIGN KEY("IdMoneda") REFERENCES "AccountsMoneda"("_id") )`
exports.android_metadata = `CREATE TABLE android_metadata (locale TEXT)`
exports.sqlite_sequence = `CREATE TABLE sqlite_sequence(name,seq)`
