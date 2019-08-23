import React from 'react'
import { NavLink } from 'react-router-dom'

const SignedOutLinks = () => {
    return (
        <ul className="right">
             <li><a href="/auth/google" className="btn btn-floating pink lighten-1">LogIn with Google</a></li>
        </ul>
    )
}

export default SignedOutLinks 