import React from 'react'
import { NavLink } from 'react-router-dom'

const SignedInLinks = () => {
    return (
        <ul className="right">
             <li><NavLink to="/">Cuentas</NavLink></li>
             <li><NavLink to="/Movimientos">Movimientos</NavLink></li>
             <li><NavLink to="/Reportes">Reportes</NavLink></li>
             <li><NavLink to="/Viajes">Viajes</NavLink></li>
             <li><a href="/api/logout">Log out</a></li>
        </ul>
    )
}

export default SignedInLinks