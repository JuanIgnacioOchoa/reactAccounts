SELECT SUM(Mov) as Total, t1.Moneda as _id, AccountsMoneda.Moneda
	FROM (
		SELECT am.*,
		CASE WHEN t1.Movimiento is not NULL
		then t1.Movimiento
		WHEN t2.Movimiento is not NULL
		then t2.Movimiento
		WHEN t3.Movimiento is not NULL
		then t3.Movimiento
		WHEN t4.Movimiento is not NULL
		then t4.Movimiento
		WHEN t5.Movimiento is not NULL
		then t5.Movimiento
		else am.Cantidad
		end as Mov,
		CASE WHEN t1.Movimiento is not NULL or t1.Movimiento is not NULL or t2.Movimiento is not NULL or 
		t3.Movimiento is not NULL or t4.Movimiento is not NULL or t5.Movimiento is not NULL
		then 9
		else am.IdMoneda
		end as Moneda
		FROM AccountsMovimiento as am
		LEFT JOIN(
			SELECT _id, Cantidad as Movimiento, Cantidad, Cambio, IdTotales, IdMoneda, Fecha, comment, 1 as type
				FROM AccountsMovimiento
					WHERE IdMoneda = 9 and IdViaje = 11
		) as t1 on am._id = t1._id
		LEFT JOIN(
			SELECT _id, Cantidad * Cambio as Movimiento, Cantidad, Cambio, IdTotales, IdMoneda, Fecha, comment, 2 as type
				FROM AccountsMovimiento as m
					WHERE IdMoneda <> 9 and IdViaje = 11 and (SELECT IdMoneda FROM AccountsTotales as t WHERE m.IdTotales = t._id) = 9
		) as t2 on am._id = t2._id
		LEFT JOIN (
			SELECT _id, Cantidad / Cambio as Movimiento, Cantidad, Cambio, IdTotales, IdMoneda, Fecha, comment, 3 as type
				FROM( 
					 SELECT A._id, Cantidad, IdTotales, A.IdMoneda, Fecha, comment , (
							SELECT Cambio 
								FROM (
									SELECT B.Fecha, B.Cambio, abs(julianday(A.Fecha) - julianday(B.Fecha)) as diff
										FROM AccountsMovimiento as B, AccountsTotales as tb
											WHERE A._id <> B._id and A.IdViaje = 11 and B.Cambio <> 1 and
												strftime(A.Fecha) is not null and julianday(B.Fecha) is not null AND
												B.IdMoneda = 9 and tb._id = B.IdTotales and tb.IdMoneda = A.IdMoneda
								)
								order by diff
								limit 1
						) as Cambio 
					FROM AccountsMovimiento as A
						where A.Cambio = 1 and A.IdViaje = 11 
				)
					WHERE Cambio is not null
		) as t3 on am._id = t3._id
		LEFT JOIN(
					SELECT _id, Cantidad * Cambio as Movimiento, Cantidad, Cambio, IdTotales, IdMoneda, Fecha, comment, 4 as type
				FROM( 
					 SELECT A._id, Cantidad, IdTotales, A.IdMoneda, Fecha, comment , (
							SELECT Cambio 
								FROM (
									SELECT B.Fecha, B.Cambio as Cambio, abs(julianday(A.Fecha) - julianday(B.Fecha)) as diff
										FROM AccountsMovimiento as B, AccountsTotales as tb
											WHERE A._id <> B._id and B.Cambio <> 1 and
												strftime(A.Fecha) is not null and julianday(B.Fecha) is not null AND
												 tb._id = B.IdTotales  and tb.IdMoneda = 9
								)
								order by diff
								limit 1
						) as Cambio,
						Cambio as c2, IdMoneda, *
					FROM AccountsMovimiento as A
						where A.Cambio = 1 and A.IdViaje = 11 and IdMoneda <> 9
				)
					WHERE Cambio is not null
		) as t4 on am._id = t4._id
		LEFT JOIN(
			SELECT _id, Cantidad * Cambio as Movimiento, Cantidad, Cambio, IdTotales, IdMoneda, Fecha, comment, 5 as type
				FROM( 
					 SELECT A._id, Cantidad, IdTotales, A.IdMoneda, Fecha, comment , (
							SELECT Cambio 
								FROM (
									SELECT B.Fecha, A.CAmbio/B.Cambio as Cambio, abs(julianday(A.Fecha) - julianday(B.Fecha)) as diff
										FROM AccountsMovimiento as B, AccountsTotales as tb
											WHERE A._id <> B._id and B.Cambio <> 1 and
												strftime(A.Fecha) is not null and julianday(B.Fecha) is not null AND
												 tb._id = B.IdTotales and tb.IdMoneda <> 9 and B.IdMoneda = 9
								)
								order by diff
								limit 1
						) as Cambio,
						Cambio as c2, IdMoneda, *
					FROM AccountsMovimiento as A
						where A.IdViaje = 11 and IdMoneda <> 9 and A.Cambio <> 1
				)
					WHERE Cambio is not null
		) as t5 on am._id = t5._id
			WHERE IdViaje = 11
		
	) as t1, AccountsMoneda
		WHERE t1.Moneda = AccountsMoneda._id
GROUP BY t1.Moneda
ORDER by abs(Total) desc