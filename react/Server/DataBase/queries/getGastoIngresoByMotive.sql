SELECT _id as _id, SUM(Ingreso) as Ingreso, SUM(Gasto) as Gasto , Motivo, isViaje, type 
    FROM(SELECT AccountsMotivo._id as _id, SUM(Ingreso) as Ingreso, SUM(Gasto) as Gasto , (case WHEN type = 2 then 'Movimiento entre cuentas' else Motivo end) as Motivo, (0) as isViaje, type    
        FROM( SELECT  sum( case WHEN Cantidad > 0 then Cantidad end ) as Ingreso,
                        sum(case WHEN Cantidad < 0 then Cantidad end) as Gasto, IdMotivo, 1 as type 
                    FROM AccountsMovimiento 
                        WHERE IdMoneda > 0 and IdMoneda = 12 and strftime('%Y',Fecha) = "2021" and strftime('%m',Fecha) = "09"       
                GROUP BY IdMotivo 
                union 
                SELECT SUM( CASE WHEN (SELECT AccountsTotales.idMoneda 
                                        FROM AccountsTotales, AccountsMovimiento as p
                                            WHERE AccountsTotales._id == IdTotales and Cambio > 0 and AccountsMovimiento._id = p._id
                                    ) <> AccountsMovimiento.IdMoneda and IdMoneda == 12 
					        then Cantidad * -1 
                        end) as Ingreso, 
                        SUM( CASE WHEN (
                            SELECT AccountsTotales.IdMoneda
                                FROM AccountsTotales, AccountsMovimiento as p
                                    WHERE AccountsTotales._id = IdTotales and Cambio <> 1 and AccountsMovimiento._id = p._id
                    ) = 12
                        then Cantidad * Cambio
                    end) as Gasto, IdMotivo, 2 as type
			        FROM AccountsMovimiento, AccountsMotivo
				        WHERE Cantidad < 0 and strftime('%Y',Fecha) = "2021" and strftime('%m',Fecha) = "09"  and 
					Cambio IS NOT NULL and Cambio <> 1 and AccountsMotivo._id = IdMotivo
		        GROUP BY IdMotivo   
                UNION
                SELECT SUM( Case 
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
                        end ) as Ingreso, 
                        SUM( CASE 
                            WHEN (
                                SELECT AccountsTotales.IdMoneda 
                                    from AccountsTotales, AccountsMovimiento as p
                                        WHERE AccountsTotales._id = IdTotales and AccountsMovimiento._id = p._id
                        ) = 12 and IdMotivo = 2 and Cambio <> 1
                        then Cantidad * Cambio * -1
                        WHEN (
                            SELECT AccountsTotales.IdMoneda 
                                from AccountsTotales, AccountsMovimiento as p
                                    WHERE AccountsTotales._id = IdTotales and AccountsMovimiento._id = p._id
                            ) = 12 and IdMotivo  = 1 and Cambio <> 1
                            then Cantidad * 1000000 * -1
                        end ) as Gasto, IdMotivo, 3 as type
                            FROM AccountsMovimiento
                                WHERE strftime('%Y',Fecha) = "2021" and strftime('%m',Fecha) = "09"       
                GROUP BY IdMotivo    ) as table1, AccountsMotivo       
                    WHERE table1.IdMotivo == AccountsMotivo._id and   Ingreso IS NOT NULL 
            GROUP BY Motivo Order BY Gasto 
        )
GROUP By Motivo Order BY Gasto 