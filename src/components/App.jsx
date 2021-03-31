import 'regenerator-runtime/runtime';
import React, {Component} from "react";
import {SystemController} from "../client/system";
import icon from '../assets/images/icon.png';
import {version} from '../../package.json';
import CloseIcon from "./Icons/CloseIcon.jsx";
import ModsList from "./ModsList.jsx";
import AddModModal from "./AddModModal.jsx";
import DownloadModModal from "./DownloadModModal.jsx";
import UpdateModModal from "./UpdateModModal.jsx";
import UninstallModModal from "./UninstallModModal.jsx";
import UpdateConfigModal from "./UpdateConfigModal.jsx";
import SettingsIcon from "./Icons/SettingsIcon.jsx";
import GameLaunchedModal from "./GameLaunchedModal.jsx";

class App extends Component {

    state = {
        mods: [],
        showAddMod: false,
        downloadRepo: null,
        updateRepo: null,
        uninstallRepo: null,
        configApp: false,
        amongUsIsRunning: false
    }

    interval = null;

    componentDidMount() {
        SystemController.checkConfig().then(isConfigured => {
            if(!isConfigured) {
                this.setState({configApp: true});
            }
        });
        SystemController.getMods().then(mods => {
            this.setState({mods});
        });
        this.interval = setInterval(async () => {
            if(await SystemController.checkAmongUsProcess()) {
                if(this.state.amongUsIsRunning === false) {
                    this.setState({amongUsIsRunning: true});
                }
            } else {
                if(this.state.amongUsIsRunning === true) {
                    await SystemController.clearAmongUsFolder();
                    this.setState({amongUsIsRunning: false});
                }
            }
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    checkConfig = () => {
        SystemController.checkConfig().then(isConfigured => {
            this.setState({configApp: !isConfigured});
        });
    }

    showAddMod = () => {
        this.setState({showAddMod: true});
    }

    hideAddMod = () => {
        this.setState({showAddMod: false});
    }

    showUpdate = updateRepo => {
        this.setState({updateRepo});
    }

    hideUpdate = () => {
        this.setState({updateRepo: null});
    }

    showUninstall = uninstallRepo => {
        this.setState({uninstallRepo});
    }

    hideUninstall = () => {
        this.setState({uninstallRepo: null});
    }

    showDownload = (downloadRepo) => {
        this.setState({downloadRepo});
    }

    hideDownload = () => {
        this.setState({downloadRepo: null});
    }

    onCloseClick = async e => {
        await SystemController.closeApp();
    }

    onMinimizeClick = async e => {
        await SystemController.minimizeApp();
    }
    addMod = mod => {
        const {mods} = this.state;
        mods.push(mod);
        this.setState({mods});
    }

    updateMod = mod => {
        const {mods} = this.state;
        for (const k in mods) {
            if(mods[k].repo === mod.repo) {
                mods[k].version = mod.version;
            }
        }
        this.setState({mods});
    }

    removeMod = repo => {
        const {mods} = this.state;
        for (const k in mods) {
            if(mods[k].repo === repo) {
                mods.splice(k, 1);
                break;
            }
        }
        this.setState({mods});
    }

    playMod = async repo => {
        await SystemController.playMod(repo);
    }

    onPlayVanillaClick = async () => {
        await SystemController.playVanilla();
    }

    showConfigApp = () => {
        this.setState({configApp: true});
    }

    render() {
        return (
            <div>
                <div className="window-bar">
                    <div className="title">
                        <img src={icon} alt="icon" className="icon"/>
                        Among Us - Mods v{version}
                    </div>
                    <div className="control-icons">
                        <div className="minimize" onClick={this.onMinimizeClick} title="Réduire">
                            <div className="bar"/>
                        </div>
                        <div className="close" onClick={this.onCloseClick} title="Fermer">
                            <CloseIcon/>
                        </div>
                    </div>
                </div>
                <div className="content">
                    <div className="header">
                        <button className="add-mod" onClick={this.showAddMod}>
                            Ajouter un mod
                        </button>
                        <button className="play-vanilla" onClick={this.onPlayVanillaClick}>
                            Jouer sans mod
                        </button>
                        <SettingsIcon onClick={this.showConfigApp}/>
                    </div>
                    <ModsList onPlay={this.playMod} onUninstall={this.showUninstall} onUpdate={this.showUpdate} mods={this.state.mods}/>
                    {this.state.configApp ? (
                        <UpdateConfigModal closeModal={this.checkConfig}/>
                    ) : (this.state.amongUsIsRunning ? (<GameLaunchedModal/>) : null)}
                    {this.state.showAddMod ? (
                        <AddModModal onSubmit={this.showDownload} closeModal={this.hideAddMod}/>
                    ) : null}
                    {this.state.downloadRepo ? (
                        <DownloadModModal addMod={this.addMod} hideModal={this.hideDownload} repo={this.state.downloadRepo}/>
                    ) : null}
                    {this.state.updateRepo ? (
                        <UpdateModModal updateMod={this.updateMod} hideModal={this.hideUpdate} repo={this.state.updateRepo}/>
                    ) : null}
                    {this.state.uninstallRepo ? (
                        <UninstallModModal removeMod={this.removeMod} hideModal={this.hideUninstall} repo={this.state.uninstallRepo}/>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default App;