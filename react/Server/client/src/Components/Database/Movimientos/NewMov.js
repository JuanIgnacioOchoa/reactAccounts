import React, {Component} from 'react'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import DateFormat from 'dateformat';
import Checkbox from './../../Components/Checkbox'
import {Redirect} from 'react-router-dom'
class NewMov extends Component{
    constructor() {
        super();
        this.state = {
            isLoaded: false,
            motives: [],
            cuentas: [],
            trips: [],
            monedas: [],
            fecha: DateFormat(new Date(), "yyyy-mm-dd"),
            toMov: false,
            cantidad: 0.0,
            moneda: 0,
            monedaCuenta: 0,
            monedaTraspaso: 0,
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        Promise.all([fetch('http://localhost:5000/getActiveMotives'),
                    fetch('http://localhost:5000/getActiveCuentas'),
                    fetch('http://localhost:5000/getActiveTrips'),
                    fetch('http://localhost:5000/getActiveCurrency'),
                ])
            .then(([motives, cuentas, trips, moneda]) => 
                Promise.all([motives.json(), cuentas.json(), trips.json(), moneda.json()]))
                .then(([motivesJson, cuentasJson, tripsJson, mondeJson]) => {
                    if(this.props.traspaso){
                        motivesJson = [{
                            value: 1,
                            label: "Traspaso"
                        }]
                    }
                    console.log('a', mondeJson)
                    console.log('a', cuentasJson)
                    this.setState({
                        isLoaded: true,
                        motives: motivesJson,
                        cuentas: cuentasJson,
                        trips: tripsJson,
                        monedas: mondeJson,
                        moneda: mondeJson[0].value,
                        monedaCuenta: cuentasJson[0].IdMoneda,
                        monedaLblCuenta: cuentasJson[0].Moneda,
                        monedaTraspaso: cuentasJson[1].IdMoneda,
                    })
                })
    }
    handleChangeCantidad(){
        this.setState({
            cantidad: this.refs.cantidad.value
        })
    }
    handleChange(date) {
        this.setState({
            fecha: DateFormat(date, "yyyy-mm-dd")
        })
    }
    handleSubmit(event) {
        const traspaso = this.props.traspaso ? this.refs.traspaso.state.value.value : null
        var cambio = 1.0;
        if(traspaso == null){
            if(this.state.monedaCuenta != this.state.moneda){
                cambio = this.refs.cambio.value
            }
        } else{
            if(this.state.monedaCuenta != this.state.monedaTraspaso){
                cambio = this.refs.cambio.value
            }
        }
        event.preventDefault();
        fetch('http://localhost:5000/AgregarMovimiento', {
          method: 'POST',
          body: JSON.stringify({
            cantidad: this.state.cantidad,
            cambio: cambio,
            moneda: this.state.moneda,
            motivo: this.refs.motivo.state.value.value,
            comentario: this.refs.comentario.value,
            cuenta: this.refs.cuenta.state.value.value,
            traspaso: traspaso,
            viaje: this.refs.viaje.state.value.value,
            fecha: this.state.fecha,
          }),
          headers: {"Content-Type": "application/json"}
        })
        .then((response) => {
            return response.json()
          }).then((body) => {
            console.log(body);
            if(body.status === "success"){
                this.setState({
                    toMov: true,
                })
            } else {
                alert('No se pudo agregar, error: ' + body.error)
            }
            //alert(self.refs.task.value)
          });

    }
    handleCheckBox(e){
        var x
        if(e){
            x = this.state.cantidad < 0 ? this.state.cantidad : this.state.cantidad * -1 
        } else {
            x = this.state.cantidad > 0 ? this.state.cantidad : this.state.cantidad * -1 
        }
        this.setState({
            cantidad: x
        })
    }
    handleChangeCuenta(e){
        this.setState({
            monedaCuenta: e.IdMoneda,
            monedaLblCuenta: e.Moneda,
        })
    }
    handleChangeTraspaso(e){
        this.setState({
            monedaTraspaso: e.IdMoneda
        })
    }
    handleChangeMoneda(e){
        this.setState({
            moneda: e.value
        })
    }
    render()
    {
        if(this.state.toMov){
            return <Redirect to='/Movimientos' />
        }
        if(this.state.isLoaded === false){
            return(
                <div className="dash">
                    Loading...
                </div>
            )
        }
        const momentArr = this.state.fecha.split('-')
        var traspaso
        var cambioHtml = ""
        var monedaHtml
        if(this.props.traspaso){
            traspaso = 
            <div style={{
                display: 'inline-block', 
                width:'30%', padding: '10px',
            //    borderLeft: 'solid 1px'
            }}>
                <Select options={this.state.cuentas} name="traspaso" ref="traspaso"
                defaultValue = {this.state.cuentas[1]}
                onChange = {(e) => this.handleChangeTraspaso(e)}
                />
            </div>
            if(this.state.monedaCuenta != this.state.monedaTraspaso){
                cambioHtml = <div style={{
                    display: 'inline-block', 
                    width: '30%', 
                    padding: '10px',
                //    borderLeft: 'solid 1px'
            }}>
                    <label htmlFor="cambio">Cambio</label>
                    <input name="cambio" ref="cambio" type="number" />
                </div>
            }
            monedaHtml = <div style={{
                        display: 'inline-block', 
                        width:'30%', padding: '10px',
                    //    borderLeft: 'solid 1px'
                        }}>
                    <label style={{fontSize: '30px'}}>{this.state.monedaLblCuenta}</label>
                </div>
        } else {
            if(this.state.moneda != this.state.monedaCuenta){
                cambioHtml = <div style={{
                    display: 'inline-block', 
                    width: '30%', 
                    padding: '10px',
                //    borderLeft: 'solid 1px'
            }}>
                    <label htmlFor="cambio">Cambio</label>
                    <input name="cambio" ref="cambio" type="number" />
                </div>
            }
            monedaHtml = <div style={{
                display: 'inline-block', 
                width:'30%', padding: '10px',
            //    borderLeft: 'solid 1px'
        }}>
            <label htmlFor="moneda">Moneda</label>
            <Select options={this.state.monedas} name="moneda" ref="moneda"
                    defaultValue = {{ value: 1, label: 'MXN' }}
                    onChange={(e) => this.handleChangeMoneda(e)}
                    />
        </div>
        }
        const divStyle = {
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center'
        }
        return(
            <div className="dash">
                <form onSubmit={this.handleSubmit}>
                    <div style={divStyle}>
                        <Checkbox label={ "Gasto" } 
                            checked={this.state.cantidad < 0} onChange={() => this.handleCheckBox(true)}/>
                        <Checkbox label={'Ingreso'}
                            checked={this.state.cantidad > 0} onChange={() => this.handleCheckBox(false)}/>
                        
                    </div>
                    <div style={{
                        paddingLeft: '40%'
                    }}>
                        <DatePicker
                            selected={new Date(momentArr[0], momentArr[1] - 1, momentArr[2])}
                            onChange={(e) => this.handleChange(e)}
                            style={{margin:'auto'}}
                        />
                    </div>
                    <div style={{
                        width: '100%', textAlign: 'center', 
                        borderTop: 'solid 1px', borderBottom: 'solid 1px'
                    }}>
                        <div style={{
                            display: 'inline-block', 
                            width:'30%', padding: '10px',
                        //    borderLeft: 'solid 1px'
                        }}>
                            <label htmlFor="cantidad">Cantidad</label>
                            <input name="cantidad" ref="cantidad" type="number" 
                                    value={this.state.cantidad} onChange={() => this.handleChangeCantidad()}/>
                        </div>
                        {monedaHtml}
                        {cambioHtml}
                    </div>
                    <div style={{
                        width: '100%', textAlign: 'center', 
                        borderBottom: 'solid 1px'
                    }}>
                        <div style={{
                            display: 'inline-block', 
                            width:'30%', padding: '10px',
                        //    borderLeft: 'solid 1px'
                        }}>
                            <label htmlFor="motivo">Motivo</label>
                                <Select options={this.state.motives} name="motivo" ref="motivo"
                                    defaultValue = {this.state.motives[0]}
                                 />
                        </div>
                        <div style={{
                            display: 'inline-block', 
                            width:'70%', padding: '10px',
                        //    borderLeft: 'solid 1px'
                        }}>
                            <label htmlFor="comentario">Comentario</label>
                            <input name="comentario" ref="comentario" type="text" />
                        </div>
                    </div>
                    <div style={{
                        width: '100%', textAlign: 'center', 
                        borderBottom: 'solid 1px'
                    }}>
                        <div style={{
                            display: 'inline-block', 
                            width:'30%', padding: '10px',
                        //    borderLeft: 'solid 1px'
                        }}>
                            <label htmlFor="cuenta">Cuenta</label>
                                <Select options={this.state.cuentas} name="cuenta" ref="cuenta"
                                    defaultValue = {this.state.cuentas[0]}
                                    onChange={(e) => this.handleChangeCuenta(e)}
                                    />
                        </div>
                        {traspaso}
                    </div>
                    <div style={{width: '100%', textAlign:'center'}}>
                        <div style={{width: '25%', display: 'inline-block'}}>
                            <label htmlFor="viaje">Viaje</label>
                            <Select options={this.state.trips} name="viaje" ref="viaje"
                                        defaultValue = {this.state.trips[0]}
                                        />
                        </div>
                    </div>
                    <button>Send data!</button>
                </form>
            </div>
        )
        /* 
                            
        */
    }
}

export default NewMov