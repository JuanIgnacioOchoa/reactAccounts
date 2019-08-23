import React, {Component} from 'react'
import ListItemTotales from './ListItemTotales'
import './../../../CSS/accounts.css'
//import axios from 'axios'

class Totales extends Component{
    constructor(props){
        super(props)
        this.state = {
            items: [],
            Positivo: 0,
            Negativo: 0,
            sLoaded: false,
        }
    }
    //TotalesTotales
    componentDidMount(){
        const moneda = 1
        Promise.all([fetch('http://localhost:5000/getTotales'),
                     fetch('http://localhost:5000/getTotalesTotales?moneda='+moneda)])
            .then(([cuentas, total]) => 
                Promise.all([cuentas.json(), total.json()]))
                .then(([cuentasJson, totalJson]) =>{
                    console.log('totalJson',totalJson)
                    const pos = totalJson[0].Positivo == null ? 0 : totalJson[0].Positivo
                    const neg = totalJson[0].Negativo == null ? 0 : totalJson[0].Negativo
                    this.setState({
                        isLoaded: true,
                        items: cuentasJson,
                        Positivo: pos,
                        Negativo: neg,
                    })
                })
    }
    render(){
        const divStyle = {
            float: 'left',
            marginLeft:'10px',
        }
        const divStyle1 = {
            float: 'left',
            marginLeft:'42%',
            color: 'green'
        }
        const divStyle2 = {
            float: 'left',
            marginLeft:'10px',
            color: 'red',
            marginBottom: '8px'
        }
        var colorTotal = 'red'
        if((this.state.Negativo + this.state.Positivo) > 0) colorTotal = 'green'
            const divStyle3 = {
                float: 'left',
                marginLeft: '10px',
                color: colorTotal,
            }
        var { isLoaded, items } = this.state

        if(!isLoaded) {
            return(
                <div className="dash">
                    Loading...
                </div>
            )
        } else {
            return(
                <div className="dash">
                    <div className="dash-header">
                        <div style={divStyle1}>
                            {this.state.Positivo.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
                        </div>
                        <div style={divStyle}>+</div>
                        <div style={divStyle2}>
                            {this.state.Negativo.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
                        </div>
                        <div style={divStyle}>=</div>
                        <div style={divStyle3}>
                            {(this.state.Negativo + this.state.Positivo).toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cuenta</th>
                                <th>CantidadInicial</th>
                                <th>Moneda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <ListItemTotales item={item} key={item._id}/>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }
    }
} 
export default Totales