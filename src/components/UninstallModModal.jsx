import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";
import UninstallIcon from "./Icons/UninstallIcon.jsx";

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
            <ModalWindow title="Désinstaller" close={this.props.hideModal}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 'calc(100% - 120px)'
                }}>
                    <div className="big-icon" style={{marginTop: 70}}>
                        <UninstallIcon/>
                    </div>
                    <div style={{margin: '3px 30px', textAlign: 'center'}}>
                        Voulez-vous vraiment désinstaller le mod <span
                        style={{fontWeight: 'bold', color: '#5555ca'}}>{data.name}</span>?
                    </div>
                    <Button onClick={this.uninstall}
                            width={350}
                            height={60}
                            color={"#861616"}
                            hoverColor={"#b03737"}
                            textColor="#FFFFFF"
                            hoverTextColor="#FFFFFF">
                        Désinstaller
                    </Button>
                </div>
            </ModalWindow>
        );
    }
}

export default UninstallModModal;