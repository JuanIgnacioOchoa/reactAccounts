import React, {Component} from 'react'
import { Redirect, NavLink } from 'react-router-dom'
import { FaPlusCircle, FaEdit } from 'react-icons/fa'
//https://fontawesome.com/icons?d=gallery
import './../../../CSS/accounts.css'

class ListItemTotales extends Component{
    constructor(){
        super()
        this.state ={
            hover: false,
        }
    }
    onMouseEnterHandler() {
        this.setState({
            hover: true
        });
    }
    onMouseLeaveHandler() {
        this.setState({
            hover: false
        });
    }
    onClickRow(){
        document.getElementById('link-'+this.props.item._id).click();
    }
    render(){
        var colorStyle = {
            color: '#000000',
        }
        if(this.props.item.CurrentCantidad < 0){
            const bgColor = this.state.hover ? '' : '#FDEDEC'
            colorStyle = {
                color: '#FF0000',
                backgroundColor: bgColor
            }
        } else if(this.props.item.CurrentCantidad > 0){
            const bgColor = this.state.hover ? '' : '#E9F7EF'
            colorStyle = {
                color: '#145A32',
                backgroundColor: bgColor,
            }
        }
        const loc = "window.location='/TotalesMov?"+this.props.item._id+"';"
        return(
                <tr id={ this.props.item._id } style={colorStyle} 
                onMouseEnter={() => this.onMouseEnterHandler()}
                onMouseLeave={() => this.onMouseLeaveHandler()}
                onClick={() => this.onClickRow()}>
                <td>{ this.props.item._id }</td>
                <td>{ this.props.item.Cuenta }</td>
                <td>
                    { this.props.item.CurrentCantidad.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) }
                </td>
                <td>{ this.props.item.Moneda }<a id={"link-" + this.props.item._id} href={"/TotalesMov?"+this.props.item._id}></a></td>
                
            </tr>
            
        )
    }
}

export default ListItemTotales