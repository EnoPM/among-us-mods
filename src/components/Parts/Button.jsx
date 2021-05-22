import React from 'react';

class Button extends React.Component {
    render() {
        const styleVariables = {
            '--btn-width':`${this.props.width}px`,
            '--btn-height': `${this.props.height}px`,
            '--btn-color': this.props.color,
            '--btn-hover-color': this.props.hoverColor,
            '--btn-text-color': this.props.textColor,
            '--btn-text-hover-color': this.props.hoverTextColor,
            '--btn-stroke-dashoffset1': `-${480/180*this.props.width}`,
            '--btn-stroke-dasharray1': `${150/180*this.props.width}`,
            '--btn-stroke-dasharray2': `${480/180*this.props.width}`,
            '--btn-stroke-dashoffset2': `${150/180*this.props.width}`
        };
        return (
            <button className="button" onClick={this.props.onClick} style={styleVariables}>
                <svg width={`${this.props.width}px`} height={`${this.props.height}px`} viewBox={`0 0 ${this.props.width} ${this.props.height}`} className="button-border">
                    <polyline points={`${this.props.width - 1},1 ${this.props.width - 1},${this.props.height - 1} 1,${this.props.height - 1} 1,1 ${this.props.width - 1},1`} className="bg-line"/>
                    <polyline points={`${this.props.width - 1},1 ${this.props.width - 1},${this.props.height - 1} 1,${this.props.height - 1} 1,1 ${this.props.width - 1},1`} className="hl-line"/>
                </svg>
                <span>{this.props.children}</span>
            </button>
        );
    }
}

export default Button;