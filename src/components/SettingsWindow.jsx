import 'regenerator-runtime/runtime';
import React, {Component} from "react";
import FileIcon from "./Icons/FileIcon.jsx";

class SettingsWindow extends Component {

    state = {
        amongUsFolder: ''
    };

    componentDidMount() {
        this.setState({
            amongUsFolder: this.props.config.amongUsFolder || ''
        });
    }

    onAmongUsFolderChange = e => {

    };

    onDirectorySelected = e => {
        this.setState({amongUsFolder: e.target.files[0].path});
    };

    saveClick = () => {
        this.props.updateConfig({
            amongUsFolder: this.state.amongUsFolder
        });
    };

    render() {
        return (
            <div className="settings-window">
                <div className="title">
                    Paramètres
                </div>
                <div className="content">
                    <div className="config-item">
                        <div className="label">
                            Exécutable Among Us :
                        </div>
                        <div className="field">
                            <input disabled type="text" style={{width: "500px"}} value={this.state.amongUsFolder}
                                   onChange={this.onAmongUsFolderChange}/>
                            <div className="file-input">
                                <div className="placeholder">
                                    <FileIcon/>
                                    <input onChange={this.onDirectorySelected} className="btn" type="file"
                                           accept=".exe"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bottom-container">
                        <div className="btn save" onClick={this.saveClick}>
                            Enregistrer
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SettingsWindow;