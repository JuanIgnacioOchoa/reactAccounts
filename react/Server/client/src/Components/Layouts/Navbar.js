import React, {Component} from 'react'
import { connect } from 'react-redux' 
//import { Link } from 'react-router-dom'
import SignedInLinks from './SignedInLinks'
import SignedOutLinks from './SignedOutLinks'

class Navbar extends Component{
    renderContent(){
        switch(this.props.auth){
            case null:
            case false:
                return <SignedOutLinks />
            default:
                return <SignedInLinks /> 
        }
    }
    renderTitle(){
        switch(this.props.auth){
            case null:
            case false:
                return "Nothing"
            default:
                return "" + this.props.auth.name
        }
    }
    render(){
        console.log('Navbar')
        console.log('props', this.props)
        const divStyle = {
            position: 'fixed',
          };
        return(
            <nav style={ divStyle }>
                <div className="nav-wrapper grey darken-3" style={{paddingLeft:'5px'}}>
                    <a className = "left brand-logo" href="/">
                        { this.renderTitle() }
                    </a>
                    {this.renderContent()}
                </div>
            </nav>
        )
    }
}

function mapStateToProps({auth}){
    return { auth }
}
export default connect(mapStateToProps)(Navbar)
/*
const Navbar = () => {
    return (
        <nav className = "nav-wrapper grey darken-3">
            <div className="container">
                <Link to='/' className="brand-logo">Mario Plan</Link>
                <SignedInLinks />
            </div>
        </nav>
    )
}

export default Navbar
*/