import React, {Component} from 'react'

class CheckBox extends Component{
    constructor(){
        super()
    }
    render(){
        return(
            <div style={
                {
                    display: 'inline-block', 
                    paddingRight: 5,
                    margin: 'auto',
                }}>
                <label>
                <input type="checkbox" checked={this.props.checked} 
                    onChange={this.props.onChange}/>
                <span>{this.props.label}</span>
                </label>
            </div>  
        )
    }
}

export default CheckBox