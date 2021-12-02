SELECT m.* 
    FROM AccountsMovimiento as m, AccountsTotales as t 
        WHERE t._id = m.IdTotales and Fecha = '2021-11-01' and IdMotivo = 55
            and (t.IdMoneda = 9 or m.IdMoneda = 9) ORDER BY Fecha DESC, _id DESC