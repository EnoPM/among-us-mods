import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";
import GithubIcon from "./Icons/GithubIcon.jsx";

class UpdateConfigModal extends React.Component {

    state = {
        amongUsFilePath: ''
    };

    onDirectorySelected = e => {
        this.setState({amongUsFilePath: e.target.files[0].path});
    };

    onSubmit = async () => {
        if(await SystemController.updateConfig(this.state.amongUsFilePath)) {
            this.props.closeModal();
        } else {
            this.setState({error: true});
        }
    }

    openGithub = async () => {
        await SystemController.openLink('https://github.com/clicpanel/among-us-mods');
    }

    render() {
        const folderPath = this.state.amongUsFilePath.replace('Among Us.exe', '');
        return (
            <div className="overlay">
                <div className="modal modal-add-mod">
                    <div className="title">
                        Configuration
                    </div>
                    <label htmlFor="among-us-executable">
                        Sélectionner l'éxecutable Among Us à utiliser :
                    </label>
                    <input ref={this.inputRef} className={this.state.error ? 'error' : ''} value={this.state.url} onChange={this.onDirectorySelected} placeholder="C:\Program Files (x86)\Steam\steamapps\common\Among Us\Among Us.exe" id="among-us-executable" type="file"/>
                    {this.state.error ? <p className="error">Le chemin d'accès à Amons Us.exe est invalide.</p> : null}
                    {folderPath.length > 0 ? <p className="description">Dossier du jeu : <span>{folderPath}</span></p> : null}
                    <div className="buttons">
                        <div className="author">
                            <div className="credits" onClick={this.openGithub}>
                                <GithubIcon/> clicpanel/among-us-mods
                            </div>
                        </div>
                        <button className="btn success" onClick={this.onSubmit}>
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default UpdateConfigModal;