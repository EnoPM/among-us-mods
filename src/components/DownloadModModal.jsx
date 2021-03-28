import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";

class DownloadModModal extends React.Component {
    state = {
        started: false,
        progress: {}
    };

    startDownload = () => {
        this.setState({started: true}, () => {
            SystemController.downloadMod(this.props.repo).then(mod => {
                this.props.addMod(mod);
                this.props.hideModal();
            });
        });
    };

    componentDidMount() {
        SystemController.on('download.mod.progress', this.onDownloadProgress);
    }

    componentWillUnmount() {
        SystemController.off('download.mod.progress', this.onDownloadProgress);
    }

    onDownloadProgress = (e, progress) => {
        this.setState({progress});
    };

    getData = () => {
        const regex = /^https:\/\/github.com\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})$/i;
        const [repo, author, name] = regex.exec(this.props.repo);
        return {
            name
        }
    }

    render() {
        const progressPercentage = this.state.progress.progress ? this.state.progress.progress + '%' : 0;
        const data = this.getData();
        return (
            <div className="overlay">
                <div className="modal modal-download-mod">
                    <div className="title" onClick={this.props.hideModal}>
                        Installer un mod
                    </div>
                    {this.state.started ? (
                        <div className="download">
                            {this.state.progress.progress ? (
                                <>
                                    <div className="info">
                                        {this.state.progress.downloaded === this.state.progress.total ? "Installation en cours..." : (<>Téléchargé : {this.state.progress.downloaded}/{this.state.progress.total}</>)}
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
                                Voulez-vous vraiment télécharger et installer le mod <span>{data.name}</span> ?
                            </div>
                            <div className="confirm-buttons">
                                <div className="btn cancel" onClick={this.props.hideModal}>
                                    Non
                                </div>
                                <div className="btn success" onClick={this.startDownload}>
                                    Oui
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default DownloadModModal;