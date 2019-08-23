const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const passport = require('passport')
const sqlite3 = require('sqlite3')
const keys = require('./config/keys')
const dbName = './databases/Account-116307006854202796538.sqlite'

require('./services/passport')

// Set up a whitelist and check against it:
var whitelist = ['http://localhost:5001', /*'http://localhost:5000'*/ ]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}
app.use(allowCrossDomain)
// Then pass them to cors:
// app.use(cors(corsOptions));
//app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use( //middleware
  cookieSession({
      maxAge: 30 * 24 * 60 * 60 * 1000,
      keys: [keys.cookieKey]
  })
)
app.use(passport.initialize()) //middleware
app.use(passport.session()) //middlewar


require('./routes/authRoutes')(app)
require('./routes/driveRoutes')(app)

app.get('/getTotales', (req, res) => {
    //res.send({ hi: 'there' })
    //console.log(db)
    const db = new sqlite3.Database(dbName)
    db.all('SELECT t._id, t.Cuenta, t.CurrentCantidad, m.Moneda ' +
    'FROM AccountsTotales as t, AccountsMoneda as m where t.IdMoneda = m._id and t.Activa = 1', 
    (err, rows) => {
         //console.log(rows)
         console.log(err)
         if(err == null){
             //console.log('a')
             res.send(rows)
         }
    })
    console.log('close')
    db.close()
})
app.get('/getTotalesTotales', (req, res) => {
  //res.send({ hi: 'there' })
  //console.log(db)
  const db = new sqlite3.Database(dbName)
  var m = req.query.moneda
  db.all('SELECT * FROM ('+
          'select Sum(CurrentCantidad) as Positivo from AccountsTotales where Activa = 1 and CurrentCantidad > 0 and IdMoneda = ?' +
        ') as t1, (' +
          'select Sum(CurrentCantidad) as Negativo from AccountsTotales where Activa = 1 and CurrentCantidad < 0 and IdMoneda = ?' +
        ') as t2',
    [m, m],
    (err, rows) => {
        //console.log(rows)
        console.log(err)
        if(err == null){
            console.log('a rows', rows)
            res.send(rows)
        }
    }
  )
  console.log('close')
  db.close()
})
app.get('/getTipoCambio/:m1/:m2', (req, res) => {
  let m1 = req.params.m1;
  let m2 = req.params.m2;
  const q = `SELECT Tipo_de_cambio as Cambio FROM AccountsCambioMoneda Where IdMoneda1 = ${m1} and IdMoneda2 = ${m2}`
  console.log('query', q) 
  const db = new sqlite3.Database(dbName)
  db.each(q, (err, rows) => {
    if(err == null){
      res.send(rows)
    } else{
      console.log('err', err)
    }
  })
  console.log('close')
  db.close()
})
app.get('/getMovimientos', (req, res) => {
  console.log('getMovimientos')
  console.log('cuenta', req.query.cuenta)
  const cuenta = req.query.cuenta != '' ? 'AND (IdTotales = ' + req.query.cuenta + ' OR Traspaso = ' + req.query.cuenta + ')' : ''
  console.log('cuenta2', cuenta)
  const start = req.query.start
  const end = req.query.end
  const db = new sqlite3.Database(dbName)
  const query = `SELECT t1._id, t1.Cantidad, t1.Fecha, t1.Cuenta, t1.Motivo, t1.Moneda, t1.IdMoneda, t1.Cambio, 
  t3.Cuenta as Traspaso, t1.comment, t2.Nombre as Viaje, t1.IdViaje, t1.IdTotales, t1.IdTraspaso, t1.IdMotivo FROM(
  Select mov._id, Cantidad, Fecha, t.Cuenta, mot.Motivo, 
CASE  WHEN mov.IdMoneda > 0 then mon.Moneda ELSE (SELECT Moneda from AccountsMoneda Where _id = t.IdMoneda) END Moneda, 
CASE  WHEN mov.IdMoneda > 0 then mon._id ELSE t.IdMoneda END IdMoneda, 
  mov.Cambio, Traspaso, comment, IdViaje, mov.IdTotales, mov.Traspaso as IdTraspaso, mov.IdMotivo
  From AccountsMovimiento as mov, AccountsTotales as t, AccountsMotivo as mot, AccountsMoneda as mon
  WHERE mov.IdTotales = t._id and mov.IdMoneda = mon._id and mov.IdMotivo = mot._id --and mov.IdViaje = v._id
) as t1
Left Join (
  SELECT * FROM AccountsTrips
) as t2 on t2._id = t1.IdViaje
Left Join (
  SELECT AccountsTotales.* FROM AccountsTotales, AccountsMoneda 
  WHERE AccountsTotales.IdMoneda = AccountsMoneda._id
) as t3 on t3._id = t1.Traspaso
WHERE Fecha BETWEEN '${start}' AND '${end}' ${cuenta}
UNION
select p._id, (p.Cantidad * -1) as Cantidad, p.Fecha, 
  CASE WHEN Cantidad > 0 THEN t.Cuenta ELSE pers.NOMBRE END Cuenta,
  CASE WHEN Cantidad > 0 THEN 'Prestamo' ELSE 'Pago' END Motivo, m.Moneda, 
CASE  WHEN p.IdMoneda > 0 then m._id ELSE t.IdMoneda END IdMoneda, 
  p.Cambio, 
  CASE WHEN Cantidad > 0 THEN pers.Nombre ELSE t.Cuenta END Traspaso, p.comment, null as Viaje,
  null as IdViaje, p.IdTotales as IdTotales, pers._id as IdTraspaso, 0 as IdMotivo
  from AccountsPrestamos as p, AccountsTotales as t, AccountsMoneda as m, AccountsPersonas as pers
  WHERE p.IdTotales = t._id and p.IdMoneda = m._id and p.IdPersona = pers._id
  and Fecha BETWEEN '${start}' AND '${end}' ${cuenta} and IdTotales <> 1
order by t1.Fecha desc`

  console.log('query getMovimientos', query)
  db.all(query,
    (err, rows) => {
      
      if(err == null){
        //res.write(JSON.stringify(rows))
        //res.write(JSON.stringify(rows))
        //res.end()
        res.send(rows)
        
      } else {
        console.log(err)
      }
    }
  )
  console.log('close')
  db.close()
})
app.get('/getGastoIngreso', (req, res) => {
  console.log('getGastoIngreso')
  var m = req.query.moneda
  var start = req.query.start
  var end = req.query.end
  var cuentaIngreso = ''
  var cuentaGasto = ''
  var cuenta = ''
  if(req.query.cuenta != ''){
    cuenta = 'AND IdTotales = ' + req.query.cuenta 
    cuentaIngreso = `
    union
    SELECT SUM(Cantidad) as Ingreso 
      From AccountsTotales, AccountsMovimiento 
        WHERE IdMotivo == 1 and Traspaso == AccountsTotales._id and AccountsTotales.IdMoneda == 1 and 
          Fecha BETWEEN '${start}' and '${end}' and Traspaso = ${req.query.cuenta }
    union
    Select SUM(Cantidad) as Ingreso 
      From AccountsTotales, AccountsPrestamosDetalle 
      WHERE AccountsTotales._id = IdTotales and Fecha BETWEEN '${start}' and '${end}' and 
      IdTotales = ${req.query.cuenta } and Cantidad > 0
    `
    cuentaGasto = `
    union
    SELECT (SUM(Cantidad)*-1) as Gasto 
      From AccountsTotales, AccountsMovimiento 
        WHERE IdMotivo == 1 and IdTotales == AccountsTotales._id and AccountsTotales.IdMoneda == 1 and 
        Fecha BETWEEN '${start}' and '${end}' and IdTotales = ${req.query.cuenta }
    union
    Select SUM(Cantidad) as Gasto 
      From AccountsTotales, AccountsPrestamos 
        WHERE AccountsTotales._id = IdTotales and Fecha BETWEEN '${start}' and '${end}' and 
        IdTotales = ${req.query.cuenta }
    union
    SELECT (SUM(pd.Cantidad*pd.Cambio) * -1) as Gasto 
      From AccountsPrestamosDetalle pd, AccountsPrestamos p 
        where IdPrestamo = p._id and pd.IdTotales = ${req.query.cuenta} and p.IdTotales = 1 and 
        pd.Fecha BETWEEN '${start}' and '${end}'
    `
  }
  const db = new sqlite3.Database(dbName)
  const query = `select * from (
    SELECT SUM(Gasto) as Gasto FROM(
        SELECT sum(Cantidad ) as Gasto FROM AccountsMovimiento WHERE Cantidad < 0 and IdMoneda == ${m} and Fecha BETWEEN '${start}' and '${end}' ${cuenta}
          union 
        SELECT SUM( CASE WHEN (SELECT AccountsTotales.idMoneda FROM AccountsTotales, AccountsMovimiento WHERE AccountsTotales._id == IdTotales and Cambio > 0) == ${m}
          then Cantidad * Cambio end) FROM AccountsMovimiento WHERE Cantidad < 0 and Fecha BETWEEN '${start}' and '${end}'and Cambio <> 1 ${cuenta}
        union 
        SELECT SUM (CASE WHEN idMotivo == 3 and (SELECT AccountsTotales.idMoneda FROM AccountsTotales, AccountsMovimiento WHERE AccountsTotales._id == IdTotales) == ${m} THEN +
          Cantidad * Cambio * -1 end) FROM AccountsMovimiento WHERE Fecha BETWEEN '${start}' and '${end}' ${cuenta}
        ${cuentaGasto}
      )) t1, (
      SELECT SUM(Ingreso) as Ingreso FROM (
        SELECT sum(Cantidad ) as Ingreso FROM AccountsMovimiento WHERE Cantidad > 0 and IdMoneda == ? and Fecha BETWEEN '${start}' and '${end}' ${cuenta}
        union
        SELECT SUM( CASE WHEN (SELECT AccountsTotales.idMoneda FROM AccountsTotales, AccountsMovimiento WHERE AccountsTotales._id == IdTotales and Cambio > 0) <> AccountsMovimiento.IdMoneda
                then Cantidad * -1 end) as Ingreso FROM AccountsMovimiento WHERE Cantidad < 0 and Fecha BETWEEN '${start}' and '${end}' and IdMoneda == ${m} and Cambio IS NOT NULL and Cambio <> 1 ${cuenta} 
        union
        SELECT  SUM(Cantidad) as Ingreso From AccountsTotales, AccountsMovimiento WHERE IdMotivo == 3 and Traspaso == AccountsTotales._id and AccountsTotales.IdMoneda == ${m} and Fecha BETWEEN '${start}' and '${end}' ${cuenta}
        ${cuentaIngreso}
      )
      ) t2`
      console.log('query', query)
  db.get(query,
      (err, rows) => {
        if(err == null){
          console.log('rows',rows)
          res.send(rows)
        } else {
          console.log(err)
        }
      })
      console.log('close')
      db.close()
})
app.get('/getActiveMotives', (req, res) => {
  const db = new sqlite3.Database(dbName)
  db.all(`SELECT _id as value, Motivo as label
      FROM AccountsMotivo 
      WHERE Active = 1`,
      (err, rows) => {
        if(err == null){
          res.send(rows)
        }
      }
  )
  console.log('close')
  db.close()
})
app.get('/getActiveCuentas', (req, res) => {
  const db = new sqlite3.Database(dbName)
  db.all(`SELECT AccountsTotales._id as value, Cuenta as label, Moneda, IdMoneda
      FROM AccountsTotales, AccountsMoneda 
      WHERE Activa = 1 and IdMoneda = AccountsMoneda._id`,
      (err, rows) => {
        if(err == null){
          res.send(rows)
        }
      }
  )
  console.log('close')
  db.close()
})
app.get('/getActiveCurrency', (req, res) => {
  const db = new sqlite3.Database(dbName)
  db.all(`SELECT _id as value, Moneda as label
      FROM AccountsMoneda 
      WHERE Active = 1`,
      (err, rows) => {
        if(err == null){
          res.send(rows)
        }
      }
  )
  console.log('close')
  db.close()
})
app.get('/getActiveTrips', (req, res) => {
  const db = new sqlite3.Database(dbName)
  db.all(`SELECT 'N/A' as label, null as value
  union
  select Nombre as label, _id as value from AccountsTrips
              WHERE FechaInicio > date('now','-2 month')`,
      (err, rows) => {
        if(err == null){
          res.send(rows)
        }
      }
  )
  console.log('close')
  db.close()
})




// Add a new todo
app.post('/updateMove/:id', (req, res, next) => {
  const db = new sqlite3.Database(dbName)
  const item = req.body.item
  let id = req.params.id;
  console.log('item', item)
  const cantidadActual = (item.Cambio != null) ? item.Cantidad * item.Cambio: item.Cantidad
  var cantidadVieja = `(SELECT CASE WHEN Cambio is null then Cantidad else Cantidad * Cambio END Cantidad FROM AccountsMovimiento WHERE _id = ${id})`;
  console.log('cantidadVieja', cantidadVieja)
  if (id) {
    var query = []
    if(item.IdMotivo > 3){ // Normal
      //Restablecer la cantidad original en la cuenta original
      query.push(`
        UPDATE AccountsTotales Set CurrentCantidad = CurrentCantidad - ${cantidadVieja}
         WHERE _id = (SELECT IdTotales From AccountsMovimiento WHERE _id = ${id})
      `)
      //Realizar la operacion de la nueva cantidad en la nueva cuenta
      query.push(`
        UPDATE AccountsTotales set CurrentCantidad = CurrentCantidad + ${cantidadActual}
        WHERE _id = ${item.IdTotales}
      `)
    } else if(item.IdMotivo == 1){ //Traspaso 
      //Restablecer la cantidad original en la cuenta original
      query.push(`
        UPDATE AccountsTotales Set CurrentCantidad = CurrentCantidad + ${cantidadVieja}
         WHERE _id = (SELECT IdTotales From AccountsMovimiento WHERE _id = ${id})
      `)
      //Realizar la operacion de la nueva cantidad en la nueva cuenta
      query.push(`
        UPDATE AccountsTotales set CurrentCantidad = CurrentCantidad - ${cantidadActual}
        WHERE _id = ${item.IdTotales}
      `)
      query.push(
        `UPDATE AccountsTotales set CurrentCantidad = CurrentCantidad - ${cantidadVieja}
        WHERE _id = (SELECT Traspaso From AccountsMovimiento WHERE _id = ${id})`
      )
      query.push(`
        UPDATE AccountsTotales set CurrentCantidad = CurrentCantidad + ${cantidadActual}
        WHERE _id = ${item.IdTraspaso}
      `)
    } else if(item.IdMotivo == 2){ //Retiro
        //Restablecer la cantidad original en la cuenta original
        query.push(`
          UPDATE AccountsTotales Set CurrentCantidad = CurrentCantidad - ${cantidadVieja}
           WHERE _id = (SELECT IdTotales From AccountsMovimiento WHERE _id = ${id})
        `)
        //Realizar la operacion de la nueva cantidad en la nueva cuenta
        query.push(`
          UPDATE AccountsTotales set CurrentCantidad = CurrentCantidad + ${cantidadActual}
          WHERE _id = ${item.IdTotales}
        `)
        query.push(
          `UPDATE AccountsTotales set CurrentCantidad = CurrentCantidad + ${cantidadVieja}
          WHERE _id = (SELECT Traspaso From AccountsMovimiento WHERE _id = ${id})`
        )
        query.push(`
          UPDATE AccountsTotales set CurrentCantidad = CurrentCantidad - ${cantidadActual}
          WHERE _id = ${item.IdTraspaso}
        `)
    } else if(item.IdMotivo == 0){// Prestamo
      //TODO ?????
    }
    //Hacer la actualizacion del movimiento
    query.push(
      `UPDATE AccountsMovimiento 
        SET Cantidad = ${item.Cantidad}, Fecha = '${item.Fecha}', IdTotales = ${item.IdTotales}, 
        IdMotivo = ${item.IdMotivo}, IdMoneda = ${item.IdMoneda}, Cambio = ${item.Cambio}, 
        Traspaso = ${item.IdTraspaso}, comment = '${item.comment}', IdViaje = ${item.IdViaje} 
        where _id = ${id}`
    )
    query.push(`
      UPDATE AccountsConfig SET Value = CURRENT_TIMESTAMP Where _id = 1
    `)
    query.push(`
      UPDATE AccountsConfig SET Value = CURRENT_TIMESTAMP Where _id = 2
    `)
    query
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
  } else{
    console.log('error 189a12mlas0')
    console.log('close')
    db.close()
    res.send({status: "error"})
  }
  console.log('close')
  db.close()
  res.send({status: "success"})
});

app.post('/AgregarMovimiento', (req, res, next) => {
  const db = new sqlite3.Database(dbName)
  const mov = req.body
  console.log('POST agregarMovimiento')
  console.log('req', mov)
  if(mov.cambio == ''){
    mov.cambio = 1.0
  }
  console.log('req', mov)
  const query = [] 
  query.push(`
    INSERT into AccountsMovimiento (Cantidad, Fecha, IdTotales, IdMotivo, IdMoneda, Cambio, Traspaso, comment, IdViaje)
    Values(${mov.cantidad}, '${mov.fecha}', ${mov.cuenta}, ${mov.motivo}, ${mov.moneda}, ${mov.cambio}, ${mov.traspaso}, '${mov.comentario}', ${mov.viaje})
  `)
  if(mov.traspaso == null){
    query.push(`
      UPDATE AccountsTotales set CurrentCantidad = CurrentCantidad + ${mov.cantidad * mov.cambio} WHERE _id = ${mov.cuenta}
    `)
  }
  query.push(`
    UPDATE AccountsConfig SET Value = CURRENT_TIMESTAMP Where _id = 1
  `)
  query.push(`
    UPDATE AccountsConfig SET Value = CURRENT_TIMESTAMP Where _id = 2
  `)

  db.serialize(function() {
    var stmt
    query.forEach((q) => {
      console.log('qh', q)
      stmt = db.prepare(q)
      stmt.run()
      stmt.finalize()
    })
  }, (err) => {
    console.log('erro2', err)
    console.log('close')
    db.close()
  });
    /*/ insert one row into the langs table
    db.run(query[0], function(err) {
      if (err) {
        res.send({status: "error", error: err.message})
        return console.log(query, err.message);
      }
      // get the last insert id
      res.send({status: "success"})
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
    */
  console.log('close')
  db.close()
  res.send({status: "success"})
})
app.listen(5000)