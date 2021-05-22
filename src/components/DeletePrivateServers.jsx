import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";
import UninstallIcon from "./Icons/UninstallIcon.jsx";

class DeletePrivateServers extends React.Component {

    deleteServer = () => {
        this.props.deleteServer(this.props.index)
        this.props.closeModal();
    }

    parseName = _name => {
        const regex = /^<color=(#[a-f0-9]+)>(.*)<\/color>$/i;
        if (_name.match(regex)) {
            const [_, color, name] = regex.exec(_name);
            return {
                name, color
            }
        } else {
            return {
                name: _name,
                color: null
            };
        }
    }

    render() {
        return (
            <ModalWindow title="Supprimer un serveur privé" close={this.props.closeModal}>
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
                        Voulez-vous vraiment supprimer le serveur <span
                        style={{fontWeight: 'bold', color: '#5555ca'}}>{this.parseName(this.props.server.Name).name}</span>?
                    </div>
                    <Button onClick={this.deleteServer}
                            width={350}
                            height={60}
                            color={"#861616"}
                            hoverColor={"#b03737"}
                            textColor="#FFFFFF"
                            hoverTextColor="#FFFFFF">
                        Supprimer
                    </Button>
                </div>
            </ModalWindow>
        );
    }
}

export default DeletePrivateServers;