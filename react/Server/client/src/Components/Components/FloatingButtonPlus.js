import React, {Component} from 'react'
import { FaPlusCircle, FaExchangeAlt } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'
import plusMinus from './../../img/plus_minus2.png'
const spanMov = 'Gasto/Ingreso'
const spanTrasp = 'Traspaso'
class FloatingButtonPlus extends Component{

    constructor(props){
        super(props)
        const btns = [
            <div className="menuBtn1 menuBtn">
                <NavLink to="/AgregarMovimiento" gasto={1}>
                    <img src={plusMinus} width='40px' height='35px'/>
                </NavLink> 
            </div>,
            <div className="menuBtnDesc" style={{right:100, bottom: 115}}>
                {spanMov}
            </div>,
            <div className="menuBtn2 menuBtn">
                <NavLink to="/AgregarTraspaso">
                    <FaExchangeAlt size={35} style={{color: 'black', cursor: 'pointer'}}/>
                </NavLink>
            </div>,
            <div className="menuBtnDesc" style={{right:100, bottom: 115}}>
                {spanTrasp}
            </div>,
            <div className="menuBtn3 menuBtn">
                <img src={plusMinus} width='40px' height='35px'/>
            </div>,
            <div className="menuBtnDesc" style={{right:100, bottom: 115}}>
                span
            </div>,
        ]
        this.state = {
            isOpen: false,
            buttons: btns,
        }
    }
    Action(){
        if(this.state.isOpen){
            const styles = { 
                transition: 'all 1s ease-in',
                transform: "translate(0px, 0px)",
                bottom: 50,
            }
            const btns = [
                <div className="menuBtn1 menuBtn" style={styles}>
                    <NavLink to="/AgregarMovimiento" gasto={1}>
                        <img src={plusMinus} width='40px' height='35px'/>
                    </NavLink> 
                </div>,
                <div className="menuBtnDesc" style={{right:100, bottom: 115}}>
                    {spanMov}
                </div>,
                <div className="menuBtn2 menuBtn" style={styles}>
                    <NavLink to="/AgregarTraspaso">
                        <FaExchangeAlt size={35} style={{color: 'black', cursor: 'pointer'}}/>
                    </NavLink>
                </div>,
                <div className="menuBtnDesc" style={{right:100, bottom: 115}}>
                    {spanTrasp}
                </div>,
                <div className="menuBtn3 menuBtn" style={styles}>
                    <img src={plusMinus} width='40px' height='35px'/>
                </div>,
                <div className="menuBtnDesc" style={{right:100, bottom: 115}}>
                    span
                </div>,
            ]
            this.setState({
                isOpen: false,
                buttons: btns,
            })
        } else{
            const styles1 = { 
                transition: 'all 1s ease-in',
                transform: "translate(0px, 0px)",
                bottom: 105,
            }
            const styles2 = { 
                transition: 'all 1s ease-in',
                transform: "translate(0px, 0px)",
                bottom: 150,
            }
            const styles3 = { 
                transition: 'all 1s ease-in',
                transform: "translate(0px, 0px)",
                bottom: 195,
            }
            const btns = [
                <div className="menuBtn1 menuBtn" style={styles1}>
                    <NavLink to="/AgregarMovimiento">
                        <img src={plusMinus} width='40px' height='35px'/>
                    </NavLink> 
                </div>,
                <div className="menuBtnDesc" id="desc1" style={{right:100, bottom: 115}}>
                    {spanMov}
                </div>,
                <div className="menuBtn2 menuBtn" style={styles2}>
                    <NavLink to="/AgregarTraspaso">
                        <FaExchangeAlt size={35} style={{color: 'black', cursor: 'pointer'}}/>
                    </NavLink>
                </div>,
                <div className="menuBtnDesc" id="desc2" style={{right:100, bottom: 160}}>
                    {spanTrasp}
                </div>,
                <div className="menuBtn3 menuBtn" style={styles3} 
                    onClick={() => this.handleOnClick3('abc')}>
                    <img src={plusMinus} width='40px' height='35px'/>
                </div>,
                <div className="menuBtnDesc" id="desc3" style={{right:100, bottom: 205}}>
                    span
                </div>,
            ]
            this.setState({
                isOpen: true,
                buttons: btns,
            })
        }
    }
    render(){
        return(
            [
                this.state.buttons.map(b => {
                    return b
                }),
                <div className="mainBtn menuBtn"
                    onClick={() => this.Action()}>
                <FaPlusCircle size={60} style={{color: 'black', cursor: 'pointer'}}/>
            </div>,
            ]
        )
    }
}
export default FloatingButtonPlus