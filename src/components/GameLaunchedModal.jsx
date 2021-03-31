import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";

class GameLaunchedModal extends React.Component {

    killAmongUsProcess = async () => {
        await SystemController.killAmongUsProcess();
    }

    render() {
        return (
            <div className="overlay">
                <div className="modal modal-download-mod">
                    <div className="confirm-box">
                        <div className="confirm-message" style={{marginBottom: 20}}>
                            Among Us est en cours d'exécution
                        </div>
                        <div className="game-loader"/>
                        <div className="close-process">
                            <button onClick={this.killAmongUsProcess}>
                                Fermer Among Us
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default GameLaunchedModal;