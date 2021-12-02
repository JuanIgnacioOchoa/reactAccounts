SELECT SUM(deuda) as deuda, sum(deudores) as deudores FROM (
	select p.Cantidad, pago, (p.Cantidad - coalesce(pago, 0.0)) as restante, (
		CASE 
			WHEN (p.Cantidad - coalesce(pago, 0.0)) < 0.0
			then (p.Cantidad - coalesce(pago, 0.0))
		end
	) as deuda, (
		CASE 
			WHEN (p.Cantidad - coalesce(pago, 0.0)) > 0.0
			then (p.Cantidad - coalesce(pago, 0.0))
		end
	) as deudores
		from AccountsPrestamos as p
	LEFT JOIN (
		SELECT  SUM(CANTIDAD) as pago, IdPrestamo
			FROM AccountsPrestamosDetalle
			GROUP BY IdPrestamo
	) as t1 on t1.IdPrestamo = p._id
		WHERE p.IdMoneda = 1
)