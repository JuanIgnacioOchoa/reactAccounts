SELECT * 
    FROM (
        SELECT (tc.Tipo || ' ' || m.Moneda) as Cuenta, 0 as CurrentCantidad, SUM(Cantidad) as Cantidad, (tc._id || m.Moneda) as _id, y, mo 
            FROM ( 
                select (coalesce(SUM(m.Cantidad * m.Cambio), 0) * -1) as Cantidad, t.Tipo as _id, 
                    (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, t.IdMoneda, 'A' as Zone
                    from AccountsTotales as t, AccountsMovimiento as m  
                        WHERE m.IdTotales = t._id and Traspaso is null and IdTotales > 15 
                            and m.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')  
                GROUP BY t.Tipo, t.IdMoneda, y, mo
                UNION 
                select SUM(CASE WHEN m.IdMotivo = 2  
                            then m.Cantidad * -1 
                            else m.Cantidad * m.Cambio * -1 END) as Cantidad, 
                    t.Tipo as _id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, t.IdMoneda, 'B' as Zone
                    from AccountsTotales as t, AccountsMovimiento as m  
                        WHERE m.Traspaso = t._id and Traspaso > 15 and m.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')   
                GROUP BY t.Tipo, y, mo, t.IdMoneda
                UNION 
                select (coalesce(SUM(m.Cantidad * m.Cambio), 0)) as Cantidad, t.Tipo as _id, (strftime('%Y',Fecha)) as y, 
                    (strftime('%m',Fecha)) as mo, t.IdMoneda, 'C' as Zone
                    from AccountsTotales as t, AccountsMovimiento as m  
                        WHERE m.IdTotales = t._id and Traspaso is not null and m.IdTotales > 15 and 
                            m.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')   
                GROUP BY t.Tipo, y, mo, t.IdMoneda
                UNION  
                select (coalesce(SUM(p.Cantidad * p.Cambio), 0)) as Cantidad, t.Tipo as _id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, t.IdMoneda, 'D' as Zone
                    from AccountsPrestamos as p, AccountsTotales as t 
                        WHERE p.IdTotales = t._id and IdMovimiento = 0 and p.IdTotales > 15 and p.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')   
                GROUP by t.Tipo, y, mo, t.IdMoneda
                UNION 
                select (coalesce(SUM(p.Cantidad * p.Cambio), 0) * -1) as Cantidad, t.Tipo as _id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, t.IdMoneda, 'E' as Zone
                    from AccountsPrestamosDetalle as p, AccountsTotales as t
                        WHERE p.IdTotales = t._id and p.IdTotales > 15 and p.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')   
                GROUP by t.Tipo, y, mo, t.IdMoneda
                UNION
                SELECT SUM(Cantidad) as Cantidad, 5 as _id, y, mo, IdMoneda, 'F' as Zone 
                    FROM(
                        SELECT (SUM( p.Cantidad * Cambio) * -1) as Cantidad, 5 as _id, (strftime('%Y', Fecha)) as y, 
                            (strftime('%m',Fecha)) as mo, p.IdMoneda, 'F' as Zone 
                            FROM AccountsPrestamos as p
                                where p.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')  
                        group by y, mo, p.IdMoneda
                        union
                        SELECT SUM( p.Cantidad * Cambio) as Cantidad, 5 as _id, (strftime('%Y', Fecha)) as y, 
                            (strftime('%m',Fecha)) as mo, p.IdMoneda, 'H' as Zone 
                            FROM AccountsPrestamosDetalle as p
                                where p.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')  
                        group by y, mo, p.IdMoneda
                    ) 
                GROUP BY y, mo, IdMoneda
            ) as s, AccountsTiposCuentas as tc, AccountsMoneda as m 
                WHERE s._id = tc._id and m._id = s.IdMoneda and s.IdMoneda > 0
        GROUP BY tc._id, y, mo, s.IdMoneda
        UNION
        SELECT t.Cuenta, t.CurrentCantidad, SUM(Cantidad) as Cantidad, t._id, y, mo  
            FROM ( 
                select (coalesce(SUM(m.Cantidad * m.Cambio), 0) * -1) as Cantidad, t._id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, 'A' as Zone
                    from AccountsTotales as t, AccountsMovimiento as m  
                        WHERE m.IdTotales = t._id and Traspaso is null and m.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')   
                GROUP BY t._id, y, mo
                UNION 
                select SUM(CASE WHEN m.IdMotivo = 2  
                                then m.Cantidad * -1 
                                else m.Cantidad * m.Cambio * -1 END) as Cantidad, 
                        t._id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, 'B' as Zone
                    from AccountsTotales as t, AccountsMovimiento as m  
                        WHERE m.Traspaso = t._id and m.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')   
                GROUP BY t._id, y, mo
                UNION 
                select (coalesce(SUM(m.Cantidad * m.Cambio), 0)) as Cantidad, t._id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, 'C' as Zone
                    from AccountsTotales as t, AccountsMovimiento as m  
                        WHERE m.IdTotales = t._id and Traspaso is not null and m.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')   
                GROUP BY t._id, y, mo
                UNION  
                select (coalesce(SUM(p.Cantidad * p.Cambio), 0)) as Cantidad, t._id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, 'D' as Zone
                    from AccountsPrestamos as p, AccountsTotales as t 
                        WHERE p.IdTotales = t._id and IdMovimiento = 0 and p.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')   
                GROUP by t._id, y, mo
                UNION 
                select (coalesce(SUM(p.Cantidad * p.Cambio), 0) * -1) as Cantidad, t._id, (strftime('%Y',Fecha)) as y, (strftime('%m',Fecha)) as mo, 'E' as Zone
                    from AccountsPrestamosDetalle as p, AccountsTotales as t 
                        WHERE p.IdTotales = t._id and p.Fecha BETWEEN date('2021-11-10', 'start of year', '-0 year') and date('2021-11-10')   
                GROUP by t._id, y, mo
            )as s, AccountsTotales t WHERE s._id = t._id
        GROUP BY t._id, y, mo
        order by y desc, mo desc
    )
		WHERE _id = 43