SELECT t1._id, t1.Cantidad, t1.Fecha, t1.Cuenta, t1.Motivo, t1.Moneda, t1.Cambio, t3.Cuenta as Traspaso, t1.comment, t2.Nombre as Viaje, t1.IdViaje, t1.IdTotales, t1.IdTraspaso, t1.IdMotivo FROM(
      Select mov._id, Cantidad, Fecha, t.Cuenta, mot.Motivo, CASE  WHEN mov.IdMoneda > 0 then mon.Moneda ELSE ' ' END Moneda, 
			mov.Cambio, Traspaso, comment, IdViaje, mov.IdTotales, mov.Traspaso as IdTraspaso, mov.IdMotivo
      From Movimiento as mov, Totales as t, Motivo as mot, Moneda as mon--, Trips as v
      WHERE mov.IdTotales = t._id and mov.IdMoneda = mon._id and mov.IdMotivo = mot._id --and mov.IdViaje = v._id
    ) as t1
    Left Join (
      SELECT * FROM Trips
    ) as t2 on t2._id = t1.IdViaje
    Left Join (
      SELECT Totales.* FROM Totales, Moneda 
      WHERE Totales.IdMoneda = Moneda._id
    ) as t3 on t3._id = t1.Traspaso
  UNION
    select 0 as _id, (p.Cantidad * -1) as Cantidad, p.Fecha, 
      CASE WHEN Cantidad > 0 THEN t.Cuenta ELSE pers.NOMBRE END Cuenta,
      CASE WHEN Cantidad > 0 THEN 'Prestamo' ELSE 'Pago' END Motivo, m.Moneda, 
      p.Cambio, 
      CASE WHEN Cantidad > 0 THEN pers.Nombre ELSE t.Cuenta END Traspaso, p.comment, null as Viaje, 
	  null as IdViaje, p.IdTotales as IdTotales, pers._id as IdTraspaso, 0 as IdMotivo
      from Prestamos as p, Totales as t, Moneda as m, Personas as pers
      WHERE p.IdTotales = t._id and p.IdMoneda = m._id and p.IdPersona = pers._id
    order by t1.Fecha desc