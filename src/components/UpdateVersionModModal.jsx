import 'regenerator-runtime/runtime';
import React from "react";
import {SystemController} from "../client/system";
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";
import {buildStyles, CircularProgressbarWithChildren} from "react-circular-progressbar";
import RadialSeparators from "./Parts/RadialSeparators.jsx";
import ErrorIcon from "./Icons/ErrorIcon.jsx";
import ArchiveIcon from "./Icons/ArchiveIcon.jsx";

class UpdateVersionModModal extends React.Component {
    state = {
        started: false,
        progress: {},
        downloadError: false,
        versionTag: '',
        versions: [],
        versionError: false
    };

    startDownload = () => {
        if(this.state.versionTag !== '') {
            this.setState({started: true}, () => {
                SystemController.updateMod(this.props.repo, this.state.versionTag).then(mod => {
                    this.props.updateMod(mod);
                    this.props.hideModal();
                }).catch(e => {
                    console.error(e);
                    this.setState({downloadError: true});
                });
            });
        }
    };

    getVersions = async () => {
        const data = this.getData();
        const mods = await SystemController.getMods();
        const [currentMod] = mods.filter(mod => mod.repo === this.props.repo);
        const currentVersion = currentMod.version;
        const response = await fetch(`https://api.github.com/repos/${data.author}/${data.name}/releases`);
        const releases = await response.json();
        return releases.map(r => r.tag_name).filter(v => v !== currentVersion);
    }

    componentDidMount() {
        SystemController.on('download.mod.progress', this.onDownloadProgress);
        this.getVersions().then(versions => {
            this.setState({versions});
        }).catch(() => {
            this.setState({versionError: true});
        });
    }

    componentWillUnmount() {
        SystemController.off('download.mod.progress', this.onDownloadProgress);
    }

    onDownloadProgress = (e, progress) => {
        this.setState({progress});
    };

    onVersionChange = e => {
        this.setState({versionTag: e.target.value});
    }

    getData = () => {
        const regex = /^https:\/\/github.com\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})$/i;
        const [repo, author, name] = regex.exec(this.props.repo);
        return {
            author,
            name
        }
    }

    render() {
        const progressValue = this.state.progress.progress ? Number.parseInt(this.state.progress.progress) : 0;
        const data = this.getData();
        return (
            <ModalWindow title="Versions précédentes" close={this.state.started ? null : this.props.hideModal}>
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
                            <div className="big-icon" style={{marginTop: 20}}>
                                <ArchiveIcon/>
                            </div>
                            <div style={{margin: '3px 30px', textAlign: 'center'}}>
                                {this.state.versionError ? (
                                    <div style={{
                                        textAlign: 'center',
                                        color: '#FF0000',
                                        fontSize: 14
                                    }}>
                                        Une erreur est survenue lors de la récupération des versions précédentes du mod <span
                                        style={{fontWeight: 'bold'}}>{data.name}</span>. Si le problème persiste
                                        veuillez prendre contact avec le support.
                                    </div>
                                ) : (
                                    <>
                                        <div style={{marginBottom: 15}}>
                                            <label htmlFor="version-select">
                                                Veuillez choisir la version à installer
                                            </label>
                                        </div>
                                        <div>
                                            <select id="version-select" onChange={this.onVersionChange} value={this.state.versionTag} style={{padding: 5, backgroundColor: '#2f2a2a', color: 'white'}}>
                                                <option value="">Sélectionner une version</option>
                                                {this.state.versions.map(version => (
                                                    <option key={version} value={version}>{version}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div style={{margin: '3px 30px', textAlign: 'center'}}>
                                Voulez-vous vraiment restaurer une version précédente du mod <span
                                style={{fontWeight: 'bold', color: '#5555ca'}}>{data.name}</span>?
                            </div>
                            {this.state.versionError ? (
                                <Button onClick={this.props.hideModal}
                                        width={350}
                                        height={60}
                                        color={"#861616"}
                                        hoverColor={"#b03737"}
                                        textColor="#FFFFFF"
                                        hoverTextColor="#FFFFFF">
                                    Annuler
                                </Button>
                            ) : (
                                <Button onClick={this.startDownload}
                                        width={350}
                                        height={60}
                                        color={"#3b8616"}
                                        hoverColor={"#5eb037"}
                                        textColor="#FFFFFF"
                                        hoverTextColor="#FFFFFF">
                                    Restaurer
                                </Button>
                            )}
                        </>
                    )}

                </div>
            </ModalWindow>
        );
    }
}

export default UpdateVersionModModal;