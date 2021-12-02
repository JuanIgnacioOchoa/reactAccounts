SELECT * 
    FROM (  
        select (Cantidad - coalesce(CantidadMenos, 0)) as Cantidad From(  
            (
                select sum(Cantidad) as Cantidad, IdMoneda 
                    from AccountsPrestamos 
                        where IdMovimiento == 0 and IdMoneda = 1 
            ) as table1  
        left join (  
            select sum(pd.Cantidad * pd.Cambio) as CantidadMenos, pd.IdMoneda  
                from AccountsPrestamos as p, AccountsPrestamosDetalle as pd   
                    where p._id = pd.IdPrestamo and p.Cantidad > 0 and pd.IdMoneda = 1 
            group by p.IdMoneda
        ) as table2 on table1.IdMoneda = table2.IdMoneda) 
    )