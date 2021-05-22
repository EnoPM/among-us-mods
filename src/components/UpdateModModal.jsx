import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";
import UpdateIcon from "./Icons/UpdateIcon.jsx";
import {buildStyles, CircularProgressbarWithChildren} from "react-circular-progressbar";
import RadialSeparators from "./Parts/RadialSeparators.jsx";
import ErrorIcon from "./Icons/ErrorIcon.jsx";

class UpdateModModal extends React.Component {
    state = {
        started: false,
        progress: {},
        downloadError: false
    };

    startDownload = () => {
        this.setState({started: true}, () => {
            SystemController.updateMod(this.props.repo).then(mod => {
                this.props.updateMod(mod);
                this.props.hideModal();
            }).catch(e => {
                console.error(e);
                this.setState({downloadError: true});
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
        const progressValue = this.state.progress.progress ? Number.parseInt(this.state.progress.progress) : 0;
        const data = this.getData();
        return (
            <ModalWindow title="Mise à jour" close={this.state.started ? null : this.props.hideModal}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 'calc(100% - 120px)'
                }}>
                    {this.state.started ? (
                        <>
                            {this.state.progress.progress ? (
                                <>
                                    <div/>
                                    <div>
                                        <CircularProgressbarWithChildren
                                            value={progressValue}
                                            text={`${progressValue}%`}
                                            strokeWidth={10}
                                            styles={buildStyles({
                                                strokeLinecap: "butt"
                                            })}
                                        >
                                            <RadialSeparators
                                                count={12}
                                                style={{
                                                    background: "#fff",
                                                    width: "2px",
                                                    // This needs to be equal to props.strokeWidth
                                                    height: `${10}%`
                                                }}
                                            />
                                        </CircularProgressbarWithChildren>
                                    </div>
                                    <div className="info">
                                        {this.state.progress.downloaded === this.state.progress.total ? "Finalisation de l'installation..." : (<>Téléchargé
                                            : {this.state.progress.downloaded}/{this.state.progress.total}</>)}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {this.state.downloadError ? (
                                        <>
                                            <div className="big-icon" style={{marginTop: 70}}>
                                                <ErrorIcon/>
                                            </div>
                                            <div style={{
                                                padding: '0 20px',
                                                textAlign: 'center',
                                                color: '#FF0000',
                                                fontSize: 14
                                            }}>
                                                Impossible d'effectuer la mise à jour du mod <span
                                                style={{fontWeight: 'bold'}}>{data.name}</span>. Si le problème persiste
                                                veuillez prendre contact avec le support.
                                            </div>
                                            <Button onClick={this.props.hideModal}
                                                    width={350}
                                                    height={60}
                                                    color={"#861616"}
                                                    hoverColor={"#b03737"}
                                                    textColor="#FFFFFF"
                                                    hoverTextColor="#FFFFFF">
                                                Annuler
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div/>
                                            <div>
                                                Démarrage du téléchargement...
                                            </div>
                                            <div/>
                                        </>
                                    )}
                                </>
                            )}

                        </>
                    ) : (
                        <>
                            <div className="big-icon" style={{marginTop: 70}}>
                                <UpdateIcon/>
                            </div>
                            <div style={{margin: '3px 30px', textAlign: 'center'}}>
                                Voulez-vous vraiment mettre à jour le mod <span
                                style={{fontWeight: 'bold', color: '#5555ca'}}>{data.name}</span>?
                            </div>
                            <Button onClick={this.startDownload}
                                    width={350}
                                    height={60}
                                    color={"#3b8616"}
                                    hoverColor={"#5eb037"}
                                    textColor="#FFFFFF"
                                    hoverTextColor="#FFFFFF">
                                Mettre à jour
                            </Button>
                        </>
                    )}

                </div>
            </ModalWindow>
        );
    }
}

export default UpdateModModal;