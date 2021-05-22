import React from 'react';
import ArrowLeftIcon from "./Icons/ArrowLeftIcon.jsx";

class ModalWindow extends React.Component {

    onCloseClick = e => {
        e.stopPropagation();
        e.preventDefault();
        if (this.props.close) {
            this.props.close();
        }
    }

    render() {
        return (
            <div className="modal-window">
                {this.props.close ? (
                    <div className="close-button" onClick={this.onCloseClick} title="Retour">
                        <ArrowLeftIcon/>
                    </div>
                ) : null}
                {this.props.title ? (
                    <div className="title">
                        {this.props.title}
                    </div>
                ) : null}
                {this.props.children}
            </div>
        );
    }
}

export default ModalWindow;