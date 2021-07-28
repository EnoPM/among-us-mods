import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";
import GithubIcon from "./Icons/GithubIcon.jsx";
import FileIcon from "./Icons/FileIcon.jsx";
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";

class UpdateConfigModal extends React.Component {

    state = {
        amongUsFilePath: '',
        showAdvancedSettings: false
    };

    componentDidMount() {
        SystemController.getConfig().then(config => {
            if (config.amongUsFolder) {
                this.setState({amongUsFilePath: config.amongUsFolder});
            }
        });
    }

    onDirectorySelected = e => {
        this.setState({amongUsFilePath: e.target.files[0].path});
    };

    onSubmit = async () => {
        if (this.state.amongUsFilePath === '') {
            if (await SystemController.checkConfig()) {
                this.props.closeModal();
            } else {
                this.setState({error: true});
            }
        } else {
            if (await SystemController.updateConfig(this.state.amongUsFilePath)) {
                this.props.closeModal();
            } else {
                this.setState({error: true});
            }
        }
    }

    openGithub = async () => {
        await SystemController.openLink('https://github.com/clicpanel/among-us-mods');
    }

    onConsoleClick = async () => {
        if(this.state.showAdvancedSettings) {
            await SystemController.openConsole();
        }
    }

    onClose = async () => {
        if (await SystemController.checkConfig()) {
            this.props.closeModal();
        } else {
            this.setState({error: true});
        }
    }

    toggleAdvanced = () => {
        this.setState({showAdvancedSettings: !this.state.showAdvancedSettings});
    }

    onRestoreAppDataClick = async () => {
        if(this.state.showAdvancedSettings) {
            if(await SystemController.checkConfig()) {
                this.props.restoreAppData();
            }
        }
    }

    render() {
        const folderPath = this.state.amongUsFilePath
            .replace('\\Among Us.exe', '')
            .replace('/Among Us.exe', '');
        return (
            <ModalWindow close={this.onClose} title="Paramètres">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 'calc(100% - 150px)'
                }}>
                    <div className="author">
                        <div className="credits" onClick={this.openGithub}>
                            <GithubIcon/> clicpanel/among-us-mods
                        </div>
                    </div>
                    <div style={{padding: '0 20px', textAlign: 'center'}}>
                        L'éxecutable <span style={{fontWeight: 'bold'}}>Among Us</span> est utilisé pour lançer le jeu avec ou sans mod.
                    </div>
                    <div style={{width: '100%'}}>
                        <label className="label-text" htmlFor="among-us-executable">
                            Sélectionner l'éxecutable Among Us à utiliser :
                            <div style={{display: "flex", alignItems: 'center'}}>
                                <FileIcon/>
                                <input className={"input-text" + (this.state.error ? ' error' : '')}
                                       style={{marginTop: 5, marginLeft: 5, pointerEvents: 'none'}}
                                       type="text"
                                       disabled value={this.state.amongUsFilePath}/>
                            </div>
                        </label>
                        <input style={{display: 'none'}} value={this.state.url}
                               onChange={this.onDirectorySelected}
                               placeholder="C:\Program Files (x86)\Steam\steamapps\common\Among Us\Among Us.exe"
                               id="among-us-executable" type="file"/>
                        {this.state.error ? <p className="error">Le chemin d'accès à Amons Us.exe est invalide.</p> : null}
                    </div>
                    <div className="advanced">
                        <div className="advanced-selector" onClick={this.toggleAdvanced}>
                            {this.state.showAdvancedSettings ? (
                                <>
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                         viewBox="0 0 256 256">
                                        <polygon points="225.813,48.907 128,146.72 30.187,48.907 0,79.093 128,207.093 256,79.093"/>
                                    </svg>
                                    Masquer les actions avancés
                                </>
                            ) : (
                                <>
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                         viewBox="0 0 256 256">
                                        <polygon points="79.093,0 48.907,30.187 146.72,128 48.907,225.813 79.093,256 207.093,128"/>
                                    </svg>
                                    Afficher les actions avancés
                                </>
                            )}
                        </div>
                        <div className="advanced-content" style={{opacity: this.state.showAdvancedSettings ? '1' : '0'}}>
                            <Button onClick={this.onConsoleClick}
                                    width={430}
                                    height={30}
                                    color={"#914a04"}
                                    hoverColor={"#d26f04"}
                                    textColor="#FFFFFF"
                                    hoverTextColor="#FFFFFF">
                                Afficher la console de développement
                            </Button>
                            <div style={{margin: '3px 30px', fontSize: 12, textAlign: 'center', color: '#7373e7'}}>
                                <span style={{fontWeight: 'bold', color: '#914a04'}}>Afficher la console de développement</span> est utile pour obtenir des informations supplémentaires pour rapporter un malfonctionnement de l'application. <span style={{fontWeight: 'bold', color: '#FF0000'}}>Il est fortement conseillé d'utiliser la console uniquement pour lire des informations</span>.
                            </div>
                            <Button onClick={this.onRestoreAppDataClick}
                                    width={430}
                                    height={30}
                                    color={"#861616"}
                                    hoverColor={"#b03737"}
                                    textColor="#FFFFFF"
                                    hoverTextColor="#FFFFFF">
                                Restaurer la configuration utilisateur
                            </Button>
                            <div style={{margin: '3px 30px', fontSize: 12, textAlign: 'center', color: '#7373e7'}}>
                                <span style={{fontWeight: 'bold', color: '#861616'}}>Restaurer la configuration utilisateur</span> supprimera les fichiers crées par <span style={{fontWeight: 'bold'}}>Among Us</span> lors du premier démarrage. Cette action ne réinitialisera pas les statistiques de votre jeu. <span style={{fontWeight: 'bold', color: '#FF0000'}}>Cette action est irreversible</span>.
                            </div>
                        </div>
                    </div>
                    <Button onClick={this.onSubmit}
                            width={350}
                            height={60}
                            color={"#3b8616"}
                            hoverColor={"#5eb037"}
                            textColor="#FFFFFF"
                            hoverTextColor="#FFFFFF">
                        Enregistrer
                    </Button>
                </div>
            </ModalWindow>
        );
    }
}

export default UpdateConfigModal;