import React, {Component} from 'react'
import ListItemMov from './ListItemMov';
import DatePicker from 'react-datepicker'
import moment from 'moment'
import "react-datepicker/dist/react-datepicker.css";
import FloatingButtonPlus from './../../../Components/Components/FloatingButtonPlus'
//import axios from 'axios'

class Movimientos extends Component{
    constructor(props){
        super(props)
        var momentArr = moment().startOf('month').format('YYYY-MM-DD').split('-')
        this.state = {
            isLoaded: false,
            dates: [],
            startDate: new Date(momentArr[0], momentArr[1] - 1, momentArr[2]),
            endDate: new Date(),
            ingreso: 0.0,
            gasto: 0.0,
            cuenta: this.props.location.search.substring(1),
        }
        this.handleChangeStart = this.handleChangeStart.bind(this)
        this.handleChangeEnd = this.handleChangeEnd.bind(this)
    }
    handleChangeStart(date) {
        this.setState({
            startDate: date
        });
    }
    handleChangeEnd(date) {
        this.setState({
            endDate: date
        });
    }
    formatDate(d) {
        var month = '' + (d.getMonth() + 1)
        var day = '' + d.getDate()
        var year = d.getFullYear()
    
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
    
        return [year, month, day].join('-');
    }
    changeTable(){
        var params = "?start="+this.formatDate(this.state.startDate)+
            "&end="+this.formatDate(this.state.endDate)+
            "&cuenta="+this.state.cuenta
        fetch('http://localhost:5000/getMovimientos'+params)
            .then(res => res.json())
            .then(json => {
                const dates = json.reduce((dateSoFar, { Fecha }, index) => {
                    if (!dateSoFar[Fecha]) dateSoFar[Fecha] = [];
                    dateSoFar[Fecha].push(json[index]);
                    return dateSoFar;
                  }, {});
                params+="&moneda=" + 1
                fetch('http://localhost:5000/getGastoIngreso'+params)
                    .then(res => res.json())
                    .then(json => {
                        const g = json['Gasto'] == null ? 0.0 : json['Gasto']
                        const i = json['Ingreso'] == null ? 0.0 : json['Ingreso']
                        this.setState({
                            dates: dates,
                            isLoaded: true,
                            ingreso: g,
                            gasto: i,
                        })
                    })
            })
    }
    componentDidMount(){
        this.changeTable()
    }
    componentDidUpdate(prevProps, prevState){
        const { endDate, startDate } = this.state;
        if (prevState.startDate !== startDate || prevState.endDate !== endDate) this.changeTable();
        console.log('something')
    }
    render(){
        const divStyle = {
            float: 'left',
            marginLeft:'10px',
        }
        const divStyle1 = {
            float: 'left',
            marginLeft:'42%',
            color: 'red'
        }
        const divStyle2 = {
            float: 'left',
            marginLeft:'10px',
            color: 'green',
            marginBottom: '8px',
        }
        var colorTotal = 'red'
        if((this.state.gasto + this.state.ingreso) > 0) colorTotal = 'green'
        const divStyle3 = {
            float: 'left',
            marginLeft: '10px',
            color: colorTotal,
        }
        var { isLoaded, dates } = this.state
        if(!isLoaded) {
            return(
                <div className="dash">
                    Loading...
                </div>
            )
        } else {
            var fechas = []
            Object.keys(dates).map(function(key, index) {
                fechas.push(key)
                return key
            })
            var date1 = null
            const res = (
                <div className="dash">
                    <div className="dash-header">
                        <DatePicker className="date-picker"
                            selected={this.state.startDate}
                            selectsStart
                            startDate={this.state.startDate}
                            endDate={this.state.endDate}
                            onChange={this.handleChangeStart}
                        />

                        <DatePicker className="date-picker"
                            selected={this.state.endDate}
                            selectsEnd
                            startDate={this.state.startDate}
                            endDate={this.state.endDate}
                            onChange={this.handleChangeEnd}
                            minDate={this.state.startDate}
                        />
                    </div>
                    <div className="dash-header">
                        <div style={divStyle1}>
                            {this.state.ingreso.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
                        </div>
                        <div style={divStyle}>+</div>
                        <div style={divStyle2}>
                            {this.state.gasto.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
                        </div>
                        <div style={divStyle}>=</div>
                        <div style={divStyle3}>
                            {(this.state.gasto + this.state.ingreso).toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th className="columnMovDate"></th>
                                <th className="columnMov">Cuenta</th>
                                <th className="columnMovCant">Cantidad</th>
                                <th className="columnMovMon">Moneda</th>
                                <th className="columnMov">Motivo</th>
                                <th className="columnMov">Tipo Cambio</th>
                                <th className="columnMov">Traspaso</th>
                                <th className="columnMov">Viaje</th>
                                <th className="columnMov">Comentario</th>
                                <th className="actionBtns"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {fechas.map(item => (
                                dates[item].map(item2 => (
                                    <ListItemMov item={item2} a = {date1 === item ? 'true': 'false'} 
                                    b = {date1 = item} key={item2._id + item} />
                                ))
                            ))}
                        </tbody>
                    </table>
                    <FloatingButtonPlus />
                </div>
            )
            return res
        }
    }
} 
export default Movimientos