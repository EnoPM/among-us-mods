import 'regenerator-runtime/runtime';
import React, {Component} from "react";
import {SystemController} from "../client/system";

class DownloadWindow extends Component {

    state = {
        started: false,
        progress: {}
    };

    startDownload = () => {
        this.setState({started: true}, () => {
            SystemController.downloadFile(this.props.mod).then(() => {
                SystemController.getInstalledMods().then(installedMods => {
                    this.props.updateInstalledMods(installedMods);
                    this.props.toggleDownload();
                });
            });
        });
    };

    componentDidMount() {
        SystemController.on('download.zip.progress', this.onDownloadProgress);
    }

    componentWillUnmount() {
        SystemController.off('download.zip.progress', this.onDownloadProgress);
    }

    onDownloadProgress = (e, progress) => {
        this.setState({progress});
    };

    render() {
        const progressPercentage = this.state.progress.progress ? this.state.progress.progress + '%' : 0;
        return (
            <div className="download-window">
                <div className="title" onClick={this.props.toggleDownload}>
                    Installer le mod {this.props.mod.name}
                </div>
                {this.state.started ? (
                    <div className="download">
                        {this.state.progress.progress ? (
                            <>
                                <div className="info">
                                    Téléchargé : {this.state.progress.downloaded}/{this.state.progress.total}
                                </div>
                                <div className="progress-bar">
                                    <div className="progression" style={{width: progressPercentage}}/>
                                </div>
                            </>
                        ) : "Démarrage du téléchargement..."}

                    </div>
                ) : (
                    <div className="confirm-box">
                        <div className="confirm-message">
                            Voulez-vous vraiment télécharger le mode <span>{this.props.mod.name}</span> ?
                        </div>
                        <div className="confirm-buttons">
                            <div className="btn yes" onClick={this.startDownload}>
                                Oui
                            </div>
                            <div className="btn no" onClick={this.props.toggleDownload}>
                                Non
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default DownloadWindow;