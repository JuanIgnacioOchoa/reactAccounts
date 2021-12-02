SELECT SUM(Gasto) as Gasto 
    FROM(
        SELECT sum(Cantidad ) as Gasto 
            FROM AccountsMovimiento 
                WHERE Cantidad < 0 and IdMoneda == 1 and strftime('%Y',Fecha) = '2021' and strftime('%m',Fecha) = '11'
        union 
        SELECT SUM( CASE WHEN (SELECT AccountsTotales.idMoneda FROM AccountsTotales, AccountsMovimiento WHERE AccountsTotales._id == IdTotales and Cambio > 0) == 1
                     then Cantidad * Cambio end) 
            FROM AccountsMovimiento 
                WHERE Cantidad < 0 and strftime('%Y',Fecha) = '2021' and strftime('%m',Fecha) = '11' and Cambio <> 1 
        union 
        SELECT SUM (CASE WHEN idMotivo == 3 and (SELECT AccountsTotales.idMoneda FROM AccountsTotales, AccountsMovimiento WHERE AccountsTotales._id == IdTotales) == 1 THEN
                     Cantidad * Cambio * -1 end) 
            FROM AccountsMovimiento 
        WHERE strftime('%Y',Fecha) = '2021' and strftime('%m',Fecha) = '11' 
    )