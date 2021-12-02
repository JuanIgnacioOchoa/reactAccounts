SELECT AccountsMotivo._id as _id, SUM(Ingreso) as Ingreso, SUM(Gasto) as Gasto , AccountsMotivo.Motivo as Motivo, (0) as isViaje  
    FROM(  
        SELECT  sum(  
                    case WHEN Cantidad > 0 then Cantidad end  
                ) as Ingreso,  
                sum(case WHEN Cantidad < 0 then Cantidad end) as Gasto, IdMotivo  
            FROM AccountsMovimiento   
                WHERE IdMoneda > 0 and IdMoneda = 9 and strftime('%Y',Fecha) = '2021' and strftime('%m') = '11' 
        GROUP BY IdMotivo  
        union
        SELECT SUM( CASE WHEN (
                    SELECT AccountsTotales.idMoneda
                        FROM AccountsTotales, AccountsMovimiento 
                            WHERE AccountsTotales._id == IdTotales and Cambio > 0 and Cantidad < 0) == 9 
                    then Cantidad * Cambio end) as Gasto,
                SUM( CASE WHEN (
                    SELECT AccountsTotales.idMoneda
                        FROM AccountsTotales, AccountsMovimiento 
                            WHERE AccountsTotales._id == IdTotales and Cambio > 0 and Cantidad > 0) == 9 
                    then Cantidad * Cambio end) as Ingreso
                IdMotivo
                FROM AccountsMovimiento 
                    WHERE strftime('%Y',Fecha) = '2021' and Cambio <> '11' 
        GROUP BY IdMotivo
        union
        SELECT SUM (CASE WHEN idMotivo == 3 and (
                        SELECT AccountsTotales.idMoneda
                            FROM AccountsTotales, AccountsMovimiento 
                                WHERE AccountsTotales._id == IdTotales) == 9
                        THEN Cantidad * Cambio * -1 end) as Gasto, 
                SUM (CASE WHEN idMotivo == 3 and (
                        SELECT AccountsTotales.idMoneda
                            FROM AccountsTotales, AccountsMovimiento 
                                WHERE AccountsTotales._id == IdTotales) == 9
                        THEN Cantidad * Cambio * -1 end) as Ingreso, 
                IdMotivo
                FROM AccountsMovimiento 
                    WHERE strftime('%Y',Fecha) = ? and strftime('%m',Fecha) = 9 
        GROUP BY IdMotivo
    ) as table1, AccountsMotivo  
        WHERE table1.IdMotivo == AccountsMotivo._id and Ingreso IS NOT NULL 
GROUP BY Motivo ORDER BY Ingreso desc