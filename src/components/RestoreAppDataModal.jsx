import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";
import ErrorIcon from "./Icons/ErrorIcon.jsx";

class RestoreAppDataModal extends React.Component {

    resetAppData = async () => {
        await SystemController.clearLocalAppdata();
        this.props.hideModal();
    }

    render() {
        return (
            <ModalWindow title="Restaurer la configuration utilisateur" close={this.props.hideModal}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 'calc(100% - 120px)'
                }}>
                    <div className="big-icon" style={{marginTop: 20}}>
                        <ErrorIcon/>
                    </div>
                    <div style={{margin: '3px 30px', textAlign: 'center'}}>
                        Voulez-vous vraiment restaurer la configuration utilisateur?
                    </div>
                    <div style={{margin: '3px 30px', textAlign: 'center', color: '#7373e7'}}>
                        <span style={{fontWeight: 'bold', color: '#861616'}}>Restaurer la configuration utilisateur</span> supprimera les fichiers crées par <span style={{fontWeight: 'bold'}}>Among Us</span> lors du premier démarrage. Cette action ne réinitialisera pas les statistiques de votre jeu. <span style={{fontWeight: 'bold', color: '#FF0000'}}>Cette action est irreversible</span>.
                    </div>
                    <Button onClick={this.resetAppData}
                            width={350}
                            height={60}
                            color={"#861616"}
                            hoverColor={"#b03737"}
                            textColor="#FFFFFF"
                            hoverTextColor="#FFFFFF">
                        Restaurer la configuration
                    </Button>
                </div>
            </ModalWindow>
        );
    }
}

export default RestoreAppDataModal;