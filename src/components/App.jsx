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
import PlusIcon from "./Icons/PlusIcon.jsx";
import GlobeIcon from "./Icons/GlobeIcon.jsx";
import Button from "./Parts/Button.jsx";
import RestoreAppDataModal from "./RestoreAppDataModal.jsx";
import UpdateVersionModModal from "./UpdateVersionModModal.jsx";
import PrivateServersModal from "./PrivateServersModal.jsx";

class App extends Component {

    state = {
        mods: [],
        showAddMod: false,
        downloadRepo: null,
        updateRepo: null,
        uninstallRepo: null,
        configApp: false,
        restoreAppData: false,
        amongUsIsRunning: false,
        currentSelection: null,
        updateRepoVersion: null,
        privateServersModal: false
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
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    showPrivateServers = () => {
        this.setState({privateServersModal: true});
    }

    hidePrivateServers = () => {
        this.setState({privateServersModal: false});
    }

    changeCurrentSelection = currentSelection => {
        this.setState({currentSelection});
    }

    resetCurrentSelection = e => {
        if(e) {
            e.stopPropagation();
        }
        this.setState({currentSelection: null});
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

    showUpdateVersion = updateRepo => {
        this.setState({updateRepoVersion: updateRepo});
    }

    hideUpdateVersion = () => {
        this.setState({updateRepoVersion: null});
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

    onRestoreAppDataClick = () => {
        this.setState({restoreAppData: true});
    }

    hideRestoreAppData = () => {
        this.setState({restoreAppData: false});
    }

    addMod = mod => {
        if(mod) {
            const {mods} = this.state;
            mods.push(mod);
            this.setState({mods}, () => {
                this.changeCurrentSelection(mod.repo);
            });
        }

    }

    updateMod = mod => {
        if(mod) {
            const {mods} = this.state;
            for (const k in mods) {
                if(mods[k].repo === mod.repo) {
                    mods[k].version = mod.version;
                }
            }
            this.setState({mods});
        }
    }

    removeMod = repo => {
        const {mods} = this.state;
        for (const k in mods) {
            if(mods[k].repo === repo) {
                mods.splice(k, 1);
                break;
            }
        }
        this.setState({mods}, () => {
            this.resetCurrentSelection();
        });
    }

    playMod = async repo => {
        await SystemController.playMod(repo);
    }

    showConfigApp = () => {
        this.setState({configApp: true});
    }

    onPlayClick = async () => {
        if(this.state.currentSelection) {
            await this.playMod(this.state.currentSelection);
        } else {
            await SystemController.playVanilla();
        }
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
                        <div className="left-buttons">
                            <button className="add-mod" onClick={this.showAddMod} title="Ajouter un mod">
                                <PlusIcon/>
                            </button>
                            <button className="manage-servers" title="Gérer les serveurs privés" onClick={this.showPrivateServers}>
                                <GlobeIcon/>
                            </button>
                        </div>
                        <div className="right-buttons">
                            <div className="settings" title="Paramètres">
                                <SettingsIcon onClick={this.showConfigApp}/>
                            </div>
                        </div>
                    </div>
                    <ModsList onUpdateVersion={this.showUpdateVersion} resetCurrentSelection={this.resetCurrentSelection} changeCurrentSelection={this.changeCurrentSelection} currentSelection={this.state.currentSelection} onPlay={this.playMod} onUninstall={this.showUninstall} onUpdate={this.showUpdate} mods={this.state.mods}/>
                    <div className={"play-button" + (this.state.currentSelection ? '' : " vanilla")}>
                        <Button onClick={this.onPlayClick}
                                width={400}
                                height={60}
                                color={this.state.currentSelection ? '#3b41ec' : '#3b8616'}
                                hoverColor={this.state.currentSelection ? '#696ef1' : '#5eb037'}
                                textColor="#FFFFFF"
                                hoverTextColor="#FFFFFF">
                            {this.state.currentSelection ? "Lancer le mod" : "Lancer Among Us"}
                        </Button>
                    </div>
                    {this.state.configApp ? (
                        <UpdateConfigModal closeModal={this.checkConfig} restoreAppData={this.onRestoreAppDataClick}/>
                    ) : null}
                    {this.state.showAddMod ? (
                        <AddModModal onSubmit={this.showDownload} closeModal={this.hideAddMod}/>
                    ) : null}
                    {this.state.downloadRepo ? (
                        <DownloadModModal addMod={this.addMod} hideModal={this.hideDownload} repo={this.state.downloadRepo}/>
                    ) : null}
                    {this.state.updateRepo ? (
                        <UpdateModModal updateMod={this.updateMod} hideModal={this.hideUpdate} repo={this.state.updateRepo}/>
                    ) : null}
                    {this.state.updateRepoVersion ? (
                        <UpdateVersionModModal updateMod={this.updateMod} hideModal={this.hideUpdateVersion} repo={this.state.updateRepoVersion}/>
                    ) : null}
                    {this.state.uninstallRepo ? (
                        <UninstallModModal removeMod={this.removeMod} hideModal={this.hideUninstall} repo={this.state.uninstallRepo}/>
                    ) : null}
                    {this.state.restoreAppData ? (
                        <RestoreAppDataModal hideModal={this.hideRestoreAppData}/>
                    ) : null}
                    {this.state.privateServersModal ? (
                        <PrivateServersModal closeModal={this.hidePrivateServers}/>
                    ) : null}
                    {this.state.amongUsIsRunning ? (<GameLaunchedModal/>) : null}
                </div>
            </div>
        );
    }
}

export default App;