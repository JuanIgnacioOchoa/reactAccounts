import React, {Component} from 'react'
import { FaEdit, FaSave, FaTimesCircle, FaMinusCircle } from 'react-icons/fa'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import DateFormat from 'dateformat';

class ListItemMov extends Component{
    constructor(props){
        super(props)
        this.state = {
            edit: false,
            isLoaded: true,
            motives: [],
            cuentas: [],
            trips: [],
            changeDate: false,
            moneda: [],
            hover: false,
        }
    }
    handleChange(date) {
        this.props.item.Fecha = DateFormat(date, "yyyy-mm-dd")
        this.setState({
            change: true,
        })
    }
    Edit(){
        console.log('edit')
        this.setState({
            edit: true,
        })
    }
    Cancel(){
        this.setState({
            edit: false,
        })
    }
    Save(){
        console.log('save')
        fetch('http://localhost:5000/updateMove/'+this.props.item._id,{
            method: 'POST',
            body: JSON.stringify({
              item: this.props.item
            }),
            headers: {"Content-Type": "application/json"}
          })
          .then((response) => {
            return response.json()
          }).then((body) => {
            console.log(body);
            if(body.status === "success"){
                this.setState({
                    edit: false,
                    change: false,
                })
            }
            //alert(self.refs.task.value)
          });
    }
    changeInput(c, element){
        const value = element.target.value
        console.log('e', value)
        console.log('a', c)
        //console.log('e', element)
        switch(c){
            case 2:
                this.props.item.Cantidad = value
                break;
            case 4:
                this.props.item.Cambio = value
                break;
            case 7:
                this.props.item.comment = value
                break;
        }
        this.setState({
            change: true,
        })
    }
    changeSelect(c, element){
        const value = element.value
        const label = element.label
        switch(c){
            case 1:
                this.props.item.Cuenta = label
                this.props.item.IdTotales = value
                break;
            case 3:
                this.props.item.Motivo = label
                this.props.item.IdMotivo = value
                break;
            case 5:
                this.props.item.Traspaso = label
                this.props.item.IdTraspaso = value
                break;
            case 6:
                this.props.item.Viaje = label
                this.props.item.IdViaje = value
                break;
            case 8:
                this.props.item.Moneda = label
                this.props.item.IdMoneda = value
                break;
        }
        this.setState({
            change: true,
        })
    }
    onDateOver(){
        var elements = document.getElementsByClassName(this.props.b);
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.backgroundColor="#ACBCFE";
        }
    }
    onDateLeave(){
        var elements = document.getElementsByClassName(this.props.b);
        for (var i = 0; i < elements.length; i++) {
            
            const cant = parseInt(elements[i].childNodes[2].innerHTML)
            const tras = elements[i].childNodes[6].innerHTML
            var bgColor = ''
            if(tras != 'N/A'){
                bgColor = this.state.hover ? '' : '#FEF9E7'
            } else if(cant < 0){
                bgColor = this.state.hover ? '' : '#FDEDEC'
            } else if(cant > 0){
                bgColor = this.state.hover ? '' : '#E9F7EF'
            }
            elements[i].style.backgroundColor=bgColor;
        }
    }
    loadMotives(){
        Promise.all([fetch('http://localhost:5000/getActiveMotives'),
                    fetch('http://localhost:5000/getActiveCuentas'),
                    fetch('http://localhost:5000/getActiveTrips'),
                    fetch('http://localhost:5000/getActiveCurrency'),
                ])
            .then(([motives, cuentas, trips, moneda]) => 
                Promise.all([motives.json(), cuentas.json(), trips.json(), moneda.json()]))
                .then(([motivesJson, cuentasJson, tripsJson, mondeJson]) => {
                    this.setState({
                        edit: true,
                        isLoaded: false,
                        motives: motivesJson,
                        cuentas: cuentasJson,
                        trips: tripsJson,
                        monedas: mondeJson,
                    })
                })
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
    componentDidUpdate(prevProps, prevState){
        const { edit } = this.state;
        if (prevState.edit !== edit && edit === true) 
        {
            this.setState({
                isLoaded: false
            })
            this.loadMotives();
            return;
        }
    }
    render(){
        
        var btn1
        if(this.state.change){
            btn1 = <FaSave size={20} onClick={() => this.Save()}/>
        } else if(this.state.edit){
            btn1 = <FaTimesCircle size={20} onClick={() => this.Cancel()}/>
        } else {
            btn1 = <FaEdit size={20} onClick={()=> this.Edit() }/>
        }
        const btn2 = <FaMinusCircle size={20} />
        var date;
        var colorStyle = {
            color: '#000000',
        }
        if(this.props.item.IdTraspaso != null){
            const bgColor = this.state.hover ? '' : '#FEF9E7'
            colorStyle = {
                color: '#000000',
                backgroundColor: bgColor
            }
        } else if(this.props.item.Cantidad < 0){
            const bgColor = this.state.hover ? '' : '#FDEDEC'
            colorStyle = {
                color: '#FF0000',
                backgroundColor: bgColor
            }
        } else if(this.props.item.Cantidad > 0){
            const bgColor = this.state.hover ? '' : '#E9F7EF'
            colorStyle = {
                color: '#145A32',
                backgroundColor: bgColor,
            }
        }
        if(this.props.isLoaded){
            return <tr id={ this.props.item._id } 
                ref={'a' + this.props.item._id} className={this.props.item.Fecha}
                style={colorStyle}
                onMouseEnter={() => this.onMouseEnterHandler()}
                onMouseLeave={() => this.onMouseLeaveHandler()}>
                <td className="columnMovDate"></td>
                    <td className="columnMov">Loading...</td>
                    <td className="columnMovCant">Loading...</td>
                    <td className="columnMovMon">Loading...</td>
                    <td className="columnMov">Loading...</td>
                    <td className="columnMov">Loading...</td>
                    <td className="columnMov">Loading...</td>
                    <td className="columnMov">Loading...</td>
                    <td className="columnMov" >Loading...</td>
                    <td className="actionBtns">Loading...</td>
            </tr>
        }
        if(this.props.a === 'false'){
            date = <tr id={this.props.b} className="dateRow" onMouseEnter={() => this.onDateOver() }
                        onMouseLeave={() => this.onDateLeave()}>
                <td className="columnMovDate1" colSpan={10}>
                    {this.props.b}
                </td>
            </tr>
        }
        var list
        if(this.state.edit){
            var selectMot
            var selectTraspaso
            var selectTrips
            var monedaHtml
            if(this.props.item.IdTraspaso == null)
            {
                selectMot = <Select options = {this.state.motives}
                                value={{ value: this.props.item.IdMotivo, label: this.props.item.Motivo}}
                                onChange={(e) => this.changeSelect(3, e)}/>
                monedaHtml = <Select options={this.state.monedas}
                                value = {{ value: this.props.item.IdMoneda, label: this.props.item.Moneda }}
                                onChange={(e) => this.changeSelect(8, e)}/>
            } else {
                selectMot = this.props.item.Motivo
                selectTraspaso = <Select options = {this.state.cuentas}
                                    value={{ value: this.props.item.IdTraspaso, label: this.props.item.Traspaso }} 
                                    onChange={(e) => this.changeSelect(5, e)} />
                monedaHtml = this.props.item.IdMoneda
                this.state.cuentas.forEach(element => {
                    if(element.value === this.props.item.IdTotales){
                        monedaHtml = element.Moneda
                        this.props.item.IdMoneda = element.IdMoneda
                        this.props.item.Moneda = monedaHtml
                    }
                });
            }
            var cambioHtml = ""
            if(this.props.item.IdTraspaso === null){
                this.state.cuentas.forEach(element => {
                    if(element.value === this.props.item.IdTotales){
                        if(element.IdMoneda != this.props.item.IdMoneda){
                            cambioHtml = <input type='number' defaultValue={this.props.item.Cambio} onChange={(e) => this.changeInput(4, e)} />
                        }
                    }
                })
            } else {
                var moneda1, moneda2
                this.state.cuentas.forEach(element => {
                    if(element.value === this.props.item.IdTotales){
                        moneda1 = element.IdMoneda
                    }
                    if(element.value === this.props.item.IdTraspaso){
                        moneda2 = element.IdMoneda
                    }
                })
                if(moneda1 != moneda2){
                    cambioHtml = <input type='number' defaultValue={this.props.item.Cambio} onChange={(e) => this.changeInput(4, e)} />
                }
            }
            selectTrips = <Select options={this.state.trips} 
                            value={{ value: this.props.item.IdViaje, label: this.props.item.Viaje }}    
                            onChange={(e) => this.changeSelect(6, e)}/>
            var momentArr = this.props.item.Fecha.split('-')
            list = [
                <tr id={ this.props.item._id } ref={'a' + this.props.item._id} 
                    className={this.props.item.Fecha} style={colorStyle}
                    onMouseEnter={() => this.onMouseEnterHandler()}
                    onMouseLeave={() => this.onMouseLeaveHandler()}>
                    <td className="columnMovDate">
                        <DatePicker
                            selected={new Date(momentArr[0], momentArr[1] - 1, momentArr[2])}
                            onChange={(e) => this.handleChange(e)}
                        />
                    </td>
                    <td className="columnMov">
                        <Select options={this.state.cuentas}
                            value={{value: this.props.item.IdTotales, label: this.props.item.Cuenta}} 
                            onChange={(e) => this.changeSelect(1, e)}/>
                    </td>
                    <td className="columnMov">
                        <input type='number' defaultValue={this.props.item.Cantidad} onChange={(e) => this.changeInput(2, e)} />
                    </td>
                    <td className="columnMov">{monedaHtml}</td>
                    <td className="columnMov">{selectMot}</td>
                    <td className="columnMov">{cambioHtml}</td>
                    <td className="columnMov">{selectTraspaso}</td>
                    <td className="columnMov">{selectTrips}</td>
                    <td className="columnMov" >
                        <input type='text' defaultValue={ this.props.item.comment } onChange={(e) => this.changeInput(7, e)}/>
                    </td>
                    <td className="actionBtns">
                        <div>
                            <div className="iconos">
                                {btn1}
                            </div>
                            <div className="iconos">
                                {btn2}
                            </div>
                        </div>
                    </td>
                </tr>,
            ]
        } else {
            var fech = ""
            if(!(this.props.item.Fecha === this.props.b))
                fech = this.props.item.Fecha
            var cambio = this.props.item.Cambio
            cambio = cambio == null || cambio == 1 ? 'N/A' : cambio
            const tras = this.props.item.Traspaso == null ? 'N/A' : this.props.item.Traspaso
            list = [
                <tr id={ this.props.item._id } ref={'a' + this.props.item._id} 
                    className={this.props.item.Fecha} style={colorStyle}
                    onMouseEnter={() => this.onMouseEnterHandler()}
                    onMouseLeave={() => this.onMouseLeaveHandler()}>
                    <td className="columnMovDate">{fech}</td>
                    <td className="columnMov">{ this.props.item.Cuenta }</td>
                    <td className="columnMov">
                        { this.props.item.Cantidad.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) + ' ' }
                    </td>
                    <td>{ this.props.item.Moneda }</td>
                    <td className="columnMov">{  this.props.item.Motivo }</td>
                    <td className="columnMov">{  cambio }</td>
                    <td className="columnMov">{  tras }</td>
                    <td className="columnMov">{  this.props.item.Viaje}</td>
                    <td className="columnMov" >{ this.props.item.comment}</td>
                    <td className="actionBtns">
                        <div>
                            <div className="iconos">
                                {btn1}
                            </div>
                            <div className="iconos">
                                {btn2}
                            </div>
                        </div>
                    </td>
                </tr>,]
        }
        return [
            date,
            list
        ]
    }
}

export default ListItemMov