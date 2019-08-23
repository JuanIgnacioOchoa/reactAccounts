import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom'
import Navbar from './Components/Layouts/Navbar';
import Totales from './Components/Database/Totales/Totales'
import Movimientos from './Components/Database/Movimientos/Movimientos';
import NewMov from './Components/Database/Movimientos/NewMov';
import { connect } from 'react-redux' // gives the ability to comunicate react with redux
import * as actions from '../src/actions'

import './CSS/accounts.css'
import './setupProxy'

class App extends Component{
  componentDidMount(){
    console.log('App componentDidMount')
    this.props.fetchUser()
  }
  render(){
    return (
      <BrowserRouter>
        <div className="App">
          <BrowserRouter>
          <div>
            <Navbar />
            <Route exact = {true} path = "/" component = {Totales} />
            <Route exact = {true} path = "/Movimientos" component = {Movimientos} />
            <Route exact = {true} path = "/TotalesMov" component = {Movimientos} />
            <Route exact = {true} path = "/AgregarMovimiento" render={() => <NewMov traspaso={false} />}/>
            <Route exact = {true} path = "/AgregarTraspaso" render={() => <NewMov traspaso={true} />}/>
          </div>
          </BrowserRouter>
        </div>
      </BrowserRouter>
    )
  }
}

export default connect(null, actions)(App);
