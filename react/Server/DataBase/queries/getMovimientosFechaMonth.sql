SELECT m._id, Fecha 
    FROM AccountsMovimiento as m, AccountsTotales as t 
        WHERE t._id = m.IdTotales and strftime('%Y',Fecha) = '2021' and 
            strftime('%d',Fecha) >= 1 and IdMotivo = 55 and (t.IdMoneda = 9 or m.IdMoneda = 9)
GROUP BY Fecha ORDER BY Fecha DESC, m._id DESC