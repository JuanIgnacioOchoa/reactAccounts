SELECT * FROM (
    SELECT (tc.Tipo || ' ' || m.Moneda) as Cuenta, 0 as CurrentCantidad, SUM(Cantidad) as Cantidad, (tc._id ||m.Moneda) as _id, y, mo, dd 
        FROM ( 
            select (coalesce(SUM(m.Cantidad * m.Cambio), 0) * -1) as Cantidad, t.Tipo as _id, (strftime('%Y',Fecha)) as y, 
                (strftime('%m',Fecha)) as mo, t.IdMoneda, (strftime('%d',Fecha)) as dd, 'A' as Zone 
                from AccountsTotales as t, AccountsMovimiento as m  
                    WHERE m.IdTotales = t._id and Traspaso is null and IdTotales > 15 
                        and m.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30')  
            GROUP BY t.Tipo, t.IdMoneda, y, mo, dd
            UNION 
            select SUM(CASE WHEN m.IdMotivo = 2  
                            then m.Cantidad * -1 
                            else m.Cantidad * m.Cambio * -1 END) as Cantidad, 
                        t.Tipo as _id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, t.IdMoneda, (strftime('%d',Fecha)) as dd, 'B' as Zone
                from AccountsTotales as t, AccountsMovimiento as m  
                    WHERE m.Traspaso = t._id and Traspaso > 15 and m.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30')  
            GROUP BY t.Tipo, y, mo, t.IdMoneda, dd
            UNION 
            select (coalesce(SUM(m.Cantidad * m.Cambio), 0)) as Cantidad, t.Tipo as _id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, t.IdMoneda, (strftime('%d',Fecha)) as dd, 'C' as Zone
                from AccountsTotales as t, AccountsMovimiento as m  
                    WHERE m.IdTotales = t._id and Traspaso is not null and m.IdTotales > 15 and m.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30')  
            GROUP BY t.Tipo, y, mo, t.IdMoneda, dd
            UNION  
            select (coalesce(SUM(p.Cantidad * p.Cambio), 0)) as Cantidad, t.Tipo as _id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, t.IdMoneda, (strftime('%d',Fecha)) as dd, 'D' as Zone
                from AccountsPrestamos as p, AccountsTotales as t 
                    WHERE p.IdTotales = t._id and IdMovimiento = 0 and p.IdTotales > 15 and p.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30')  
            GROUP by t.Tipo, y, mo, t.IdMoneda, dd
            UNION 
            select (coalesce(SUM(p.Cantidad * p.Cambio), 0) * -1) as Cantidad, t.Tipo as _id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, t.IdMoneda, (strftime('%d',Fecha)) as dd, 'E' as Zone
                from AccountsPrestamosDetalle as p, AccountsTotales as t
                    WHERE p.IdTotales = t._id and p.IdTotales > 15 and p.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30')  
            GROUP by t.Tipo, y, mo, t.IdMoneda, dd
            UNION
            SELECT SUM(Cantidad) as Cantidad, 5 as _id, y, mo, IdMoneda, dd, 'F' as Zone 
                FROM(
                    SELECT (SUM( p.Cantidad * Cambio) * -1) as Cantidad, 5 as _id, (strftime('%Y', Fecha)) as y, (strftime('%m',Fecha)) as mo, p.IdMoneda, (strftime('%d',Fecha)) as dd, 'F' as Zone 
                        FROM AccountsPrestamos as p
                            where p.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30') 
                    group by y, mo, p.IdMoneda, dd
                    union
                    SELECT (SUM( p.Cantidad * Cambio)) as Cantidad, 5 as _id, (strftime('%Y', Fecha)) as y, (strftime('%m',Fecha)) as mo, p.IdMoneda, (strftime('%d',Fecha)) as dd, 'H' as Zone 
                        FROM AccountsPrestamosDetalle as p
                            where p.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30') 
                    group by y, mo, p.IdMoneda, dd
                ) 
            GROUP BY y, mo, IdMoneda, dd
        )as s, AccountsTiposCuentas as tc, AccountsMoneda as m 
            WHERE s._id = tc._id and m._id = s.IdMoneda and s.IdMoneda > 0
    GROUP BY tc._id, y, mo, s.IdMoneda, dd
    UNION
    SELECT t.Cuenta, t.CurrentCantidad, SUM(Cantidad) as Cantidad, t._id, y, mo, dd 
        FROM ( 
            select (coalesce(SUM(m.Cantidad * m.Cambio), 0) * -1) as Cantidad, t._id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, (strftime('%d',Fecha)) as dd, 'A' as Zone
                from AccountsTotales as t, AccountsMovimiento as m  
                    WHERE m.IdTotales = t._id and Traspaso is null and m.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30')  
            GROUP BY t._id, y, mo, dd
            UNION 
            select SUM(CASE WHEN m.IdMotivo = 2  
                then m.Cantidad * -1 
                else m.Cantidad * m.Cambio * -1 END) as Cantidad, t._id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, (strftime('%d',Fecha)) as dd, 'B' as Zone
                from AccountsTotales as t, AccountsMovimiento as m  
                    WHERE m.Traspaso = t._id and m.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30')  
            GROUP BY t._id, y, mo, dd
            UNION 
            select (coalesce(SUM(m.Cantidad * m.Cambio), 0)) as Cantidad, t._id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, (strftime('%d',Fecha)) as dd, 'C' as Zone
                from AccountsTotales as t, AccountsMovimiento as m  
                    WHERE m.IdTotales = t._id and Traspaso is not null and m.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30')  
            GROUP BY t._id, y, mo, dd
            UNION  
            select (coalesce(SUM(p.Cantidad * p.Cambio), 0)) as Cantidad, t._id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, (strftime('%d',Fecha)) as dd, 'D' as Zone
                from AccountsPrestamos as p, AccountsTotales as t 
                    WHERE p.IdTotales = t._id and IdMovimiento = 0 and p.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30')  
            GROUP by t._id, y, mo, dd
            UNION 
            select (coalesce(SUM(p.Cantidad * p.Cambio), 0) * -1) as Cantidad, t._id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, (strftime('%d',Fecha)) as dd, 'E' as Zone
                from AccountsPrestamosDetalle as p, AccountsTotales as t 
                    WHERE p.IdTotales = t._id and p.Fecha BETWEEN date('2021-09-30', 'start of month', '-0 month') and date('2021-09-30')  
            GROUP by t._id, y, mo, dd
        )as s, AccountsTotales t 
            WHERE s._id = t._id  
    GROUP BY t._id, y, mo, dd
    order by y desc, mo desc, dd desc
)