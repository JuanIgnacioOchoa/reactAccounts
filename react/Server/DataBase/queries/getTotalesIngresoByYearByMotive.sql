SELECT  
    AccountsMotivo._id as _id, SUM(Ingreso) as Ingreso , AccountsMotivo.Motivo as Motivo, (0) as isViaje 
    FROM( 
        SELECT  
            sum(Cantidad ) as Ingreso, IdMotivo 
            FROM AccountsMovimiento  
            WHERE IdMoneda > 0 and IdMoneda = 9 and strftime('%Y',Fecha) = '2021' and Cantidad > 0 GROUP BY IdMotivo 
        union 
        SELECT  
            SUM( CASE WHEN ( 
                SELECT  
                    AccountsTotales.idMoneda 
                    FROM AccountsTotales, AccountsMovimiento  
                    WHERE AccountsTotales._id == IdTotales and Cambio > 0) == 9  
                then Cantidad * Cambio end) as Ingreso, 
                IdMotivo 
            FROM AccountsMovimiento  
            WHERE IdMoneda > 0 and Cantidad > 0 and strftime('%Y',Fecha) = '2021' and Cambio <> 1 GROUP BY IdMotivo 
        union 
        SELECT  
            SUM (CASE WHEN idMotivo == 3 and ( 
                SELECT  
                    AccountsTotales.idMoneda 
                    FROM AccountsTotales, AccountsMovimiento  
                    WHERE AccountsTotales._id == IdTotales) == 9 THEN 
                    Cantidad * Cambio * -1 end) as Ingreso,  
                IdMotivo 
                FROM AccountsMovimiento  
                WHERE IdMoneda > 0 and strftime('%Y',Fecha) = '2021' GROUP BY IdMotivo) as table1, AccountsMotivo  
    WHERE table1.IdMotivo == AccountsMotivo._id and (Ingreso IS NOT NULL)  
GROUP BY Motivo ORDER BY Ingreso desc