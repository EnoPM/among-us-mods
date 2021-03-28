import React from "react";
import UpdateIcon from "./Icons/UpdateIcon.jsx";
import PlayIcon from "./Icons/PlayIcon.jsx";
import UninstallIcon from "./Icons/UninstallIcon.jsx";
import GithubIcon from "./Icons/GithubIcon.jsx";
import {SystemController} from "../client/system";

class ModsList extends React.Component {

    render() {
        return (
            <ul className="mods-list">
                {this.props.mods.map(mod => <Mod onPlay={this.props.onPlay} onUninstall={this.props.onUninstall} onUpdate={this.props.onUpdate} key={mod.repo} mod={mod}/>)}
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
        if(!this.state.updateLoading) {
            if(this.state.hasUpdate && this.state.lastVersion && this.state.lastVersion !== this.props.mod.version) {
                this.props.onUpdate(this.props.mod.repo);
            } else {
                this.setState({updateLoading: true}, () => {
                    this.checkUpdate();
                });
            }
        }

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.mod.version !== this.props.mod.version) {
            this.setState({updateLoading: true}, () => {
                this.checkUpdate();
            });
        }
    }

    onUninstallClick = () => {
        this.props.onUninstall(this.props.mod.repo);
    }

    onPlayClick = () => {
        this.props.onPlay(this.props.mod.repo);
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

    openRepo = async () => {
        await SystemController.openLink(this.props.mod.repo);
    }

    render() {
        const data = this.getData();
        const hasUpdate = this.state.hasUpdate && this.state.lastVersion && this.state.lastVersion !== this.props.mod.version;
        const updateClassName = 'update' + (this.state.updateLoading ? ' loading' : '') + (hasUpdate ? ' has-update' : '');
        const updateTitle = this.state.updateLoading ? "Vérification des mises à jour..." : (hasUpdate ? "Une mise à jour est disponible" : "Vérifier les mises à jour")
        return (
            <li className="mod-item">
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
                    <div className="uninstall" title="Désinstaller" onClick={this.onUninstallClick}>
                        <UninstallIcon/>
                    </div>
                    <div className={updateClassName} title={updateTitle} onClick={this.onUpdateClick}>
                        <UpdateIcon/>
                    </div>
                    {!hasUpdate && !this.state.updateLoading ? (
                        <div className="play" title="Lancer le jeu" onClick={this.onPlayClick}>
                            <PlayIcon/>
                        </div>
                    ) : null}
                </div>
            </li>
        );
    }
}

export default ModsList;