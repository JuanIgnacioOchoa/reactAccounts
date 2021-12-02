SELECT SUM(Ingreso) as Ingreso FROM ( 
                  SELECT sum(Cantidad ) as Ingreso FROM AccountsMovimiento WHERE Cantidad > 0 and IdMoneda == 9 and strftime('%Y',Fecha) == '2021' and strftime('%m', Fecha) = '09' 
                union 
                 
                SELECT SUM( CASE WHEN (SELECT AccountsTotales.idMoneda FROM AccountsTotales, AccountsMovimiento WHERE AccountsTotales._id == IdTotales and Cambio > 0) <> AccountsMovimiento.IdMoneda 
                                then Cantidad * -1 end) as Ingreso FROM AccountsMovimiento WHERE Cantidad < 0 and strftime('%Y',Fecha) == '2021' and strftime('%m', Fecha) = '09'  and IdMoneda == 12 and Cambio IS NOT NULL and Cambio <> 1  
                union 
                SELECT sum( Case 
					WHEN (
							SELECT AccountsTotales.IdMoneda 
								from AccountsTotales, AccountsMovimiento as p
									WHERE AccountsTotales._id = Traspaso and AccountsMovimiento._id = p._id
					) = 12 and IdMotivo = 2 and Cambio <> 1
					then Cantidad 
					WHEN (
						SELECT AccountsTotales.IdMoneda 
								from AccountsTotales, AccountsMovimiento as p
									WHERE AccountsTotales._id = Traspaso and AccountsMovimiento._id = p._id
					) = 12 and IdMotivo = 1 and Cambio <> 1
					then Cantidad * 1000
				end ) as Ingreso		
				FROM AccountsMovimiento
					WHERE strftime('%Y',Fecha) = '2021' and strftime('%m', Fecha) = '09' 
			GROUP BY IdMotivo
                )