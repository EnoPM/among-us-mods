import React from "react";
import UpdateIcon from "./Icons/UpdateIcon.jsx";
import PlayIcon from "./Icons/PlayIcon.jsx";
import UninstallIcon from "./Icons/UninstallIcon.jsx";
import GithubIcon from "./Icons/GithubIcon.jsx";
import {SystemController} from "../client/system";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import FileIcon from "./Icons/FileIcon.jsx";

class ModsList extends React.Component {

    onSelectionChange = mod => {
        this.props.changeCurrentSelection(this.props.currentSelection === mod.repo ? null : mod.repo);
    }

    render() {
        return (
            <ul className="mods-list" onClick={this.props.resetCurrentSelection}>

                {this.props.mods.map(mod => <Mod selected={mod && this.props.currentSelection === mod.repo} onUpdateVersion={this.props.onUpdateVersion} onSelectionChange={this.onSelectionChange} onPlay={this.props.onPlay} onUninstall={this.props.onUninstall} onUpdate={this.props.onUpdate} key={mod.repo} mod={mod}/>)}
            </ul>
        );
    }
}

class Mod extends React.Component {

    state = {
        hasUpdate: false,
        updateLoading: true,
        lastVersion: null
    }

    componentDidMount() {
        this.checkUpdate();
    }

    onUpdateClick = e => {
        e.stopPropagation();
        if(!this.state.updateLoading) {
            if(this.state.hasUpdate && this.state.lastVersion && this.state.lastVersion !== this.props.mod.version) {
                this.props.onUpdate(this.props.mod.repo);
            } else {
                this.setState({updateLoading: true}, async () => {
                    await this.checkUpdate();
                });
            }
        }
    }

    onUpdateVersionClick = e => {
        e.stopPropagation();
        if(!this.state.updateLoading) {
            this.props.onUpdateVersion(this.props.mod.repo);
        }
    }

    onOpenFolderClick = async e => {
        e.stopPropagation();
        await SystemController.openFolder(this.props.mod.repo);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.mod.version !== this.props.mod.version) {
            this.setState({updateLoading: true}, () => {
                this.checkUpdate();
            });
        }
    }

    onUninstallClick = (e) => {
        e.stopPropagation();
        this.props.onUninstall(this.props.mod.repo);
    }

    checkUpdate = async () => {
        const data = this.getData();
        const response = await fetch(`https://api.github.com/repos/${data.author}/${data.name}/releases`);
        const releases = await response.json();
        if(releases[0] && releases[0].tag_name !== this.props.mod.version) {
            this.setState({hasUpdate: true, updateLoading: false, lastVersion: releases[0].tag_name});
        } else {
            this.setState({hasUpdate: false, updateLoading: false, lastVersion: null});
        }
    }

    getData = () => {
        const regex = /^https:\/\/github.com\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})$/i;
        const [repo, author, name] = regex.exec(this.props.mod.repo);
        return {
            repo, author, name
        };
    }

    openRepo = async (e) => {
        if(this.props.selected) {
            e.stopPropagation();
            await SystemController.openLink(this.props.mod.repo);
        }
    }

    onClick = e => {
        e.stopPropagation();
        if(!this.state.updateLoading) {
            this.props.onSelectionChange(this.props.mod);
        }
    }

    onContextMenu = e => {
        if(!this.props.selected) {
            this.props.onSelectionChange(this.props.mod);
        }
    }

    render() {
        const data = this.getData();
        const hasUpdate = this.state.hasUpdate && this.state.lastVersion && this.state.lastVersion !== this.props.mod.version;
        const updateClassName = 'update' + (this.state.updateLoading ? ' loading' : '') + (hasUpdate ? ' has-update' : '');
        const updateTitle = this.state.updateLoading ? "Vérification des mises à jour..." : (hasUpdate ? "Une mise à jour est disponible" : "Vérifier les mises à jour")
        return (
            <>
                <ContextMenuTrigger id={this.props.mod.repo}>
                    <li onContextMenu={this.onContextMenu} className={"mod-item" + (this.props.selected ? " selected" : '')} onClick={this.onClick}>
                        <div className="infos">
                            <div className="name">
                                {data.name}
                                <div className={"version" + (hasUpdate? ' has-update' : '')}>
                                    {this.props.mod.version}
                                </div>
                                {hasUpdate ? (
                                    <>
                                        <div className="arrow">➜</div>
                                        <div className="version">
                                            {this.state.lastVersion}
                                        </div>
                                    </>

                                ) : null}
                            </div>
                            <div className="github" onClick={this.openRepo}>
                                <GithubIcon/> {data.author}/{data.name}
                            </div>
                        </div>
                        <div className="buttons">
                            <div className={updateClassName} title={updateTitle} onClick={this.onUpdateClick}>
                                <UpdateIcon/>
                            </div>
                        </div>
                    </li>
                </ContextMenuTrigger>
                <ContextMenu id={this.props.mod.repo}>
                    <MenuItem onClick={this.onUpdateClick}>
                        {hasUpdate ? "Mise à jour" : "Vérifier les mises à jour"}
                    </MenuItem>
                    <MenuItem onClick={this.onUpdateVersionClick}>
                        Versions précédentes
                    </MenuItem>
                    <MenuItem onClick={this.onOpenFolderClick}>
                        Ouvrir le dossier du mod
                    </MenuItem>
                    <MenuItem onClick={this.openRepo}>
                        Ouvrir le dépôt du mod
                    </MenuItem>
                    <MenuItem onClick={this.onUninstallClick}>
                        <span className="danger">Désinstaller</span>
                    </MenuItem>
                </ContextMenu>
            </>
        );
    }
}

export default ModsList;