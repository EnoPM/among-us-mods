import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";
import loading from '../assets/images/loading.gif';
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";

class GameLaunchedModal extends React.Component {

    killAmongUsProcess = async () => {
        await SystemController.killAmongUsProcess();
    }

    render() {
        return (
            <ModalWindow title="Among Us est en cours d'exécution">
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', height: 'calc(100% - 150px)'}}>
                    <div style={{padding: '0 20px', textAlign: 'center'}}>
                        Vous ne pouvez pas utiliser <span style={{fontWeight: 'bold'}}>Among Us Mods</span> pendant qu'une instance d'<span style={{fontWeight: 'bold'}}>Among Us</span> est lancée.
                    </div>
                    <div style={{height: 300, width: 275, backgroundImage: `url(${loading})`, backgroundSize: 'contain'}}/>
                    <div>
                        <Button onClick={this.killAmongUsProcess}
                                width={350}
                                height={60}
                                color={"#9b0e0e"}
                                hoverColor={"#db1414"}
                                textColor="#FFFFFF"
                                hoverTextColor="#FFFFFF">
                            Fermer Among Us
                        </Button>
                    </div>
                </div>
            </ModalWindow>
        );
    }
}

export default GameLaunchedModal;