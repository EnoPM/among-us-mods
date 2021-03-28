import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";

class UninstallModModal extends React.Component {

    getData = () => {
        const regex = /^https:\/\/github.com\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})$/i;
        const [repo, author, name] = regex.exec(this.props.repo);
        return {
            name
        }
    }

    uninstall = async () => {
        await SystemController.uninstallMod(this.props.repo);
        this.props.removeMod(this.props.repo);
        this.props.hideModal();
    }

    render() {
        const data = this.getData();
        return (
            <div className="overlay">
                <div className="modal modal-download-mod">
                    <div className="title" onClick={this.props.hideModal}>
                        Désinstaller
                    </div>
                    <div className="confirm-box">
                        <div className="confirm-message">
                            Voulez-vous vraiment désinstaller le mod <span>{data.name}</span> ?
                        </div>
                        <div className="confirm-buttons">
                            <div className="btn cancel" onClick={this.props.hideModal}>
                                Non
                            </div>
                            <div className="btn success" onClick={this.uninstall}>
                                Oui
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default UninstallModModal;