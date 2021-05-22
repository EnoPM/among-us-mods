import React from "react";
import {SystemController} from "../client/system";
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";
import {SketchPicker} from 'react-color';
import AddPrivateServersModal from "./AddPrivateServersModal.jsx";
import {ContextMenu, ContextMenuTrigger, MenuItem} from "react-contextmenu";
import EditPrivateServersModal from "./EditPrivateServersModal.jsx";
import DeletePrivateServers from "./DeletePrivateServers.jsx";

const OFFICIAL_REGIONS_URL = 'https://raw.githubusercontent.com/clicpanel/among-us-mods/master/default/official_regions.json';

class PrivateServersModal extends React.Component {
    state = {
        Regions: [],
        CurrentRegionIdx: 0,
        officialRegions: [],
        showAddServer: false,
        showEdit: null,
        showDelete: null
    }

    componentDidMount() {
        SystemController.getRegions().then(regions => {
            if (regions) {
                this.setState(regions);
                console.log(regions);
            }
        });
        fetch(OFFICIAL_REGIONS_URL).then(async response => {
            const officialRegions = await response.json();
            if (officialRegions) {
                this.setState({officialRegions});
            }
        });
    }

    showDelete = (index) => this.setState({showDelete: index});
    showEdit = (index) => this.setState({showEdit: index});
    hideEdit = () => this.setState({showEdit: null});
    hideDelete = () => this.setState({showDelete: null});

    showAddServer = () => this.setState({showAddServer: true});
    hideAddServer = () => this.setState({showAddServer: false});

    saveRegions = async () => {
        await SystemController.setRegions({
            CurrentRegionIdx: this.state.CurrentRegionIdx,
            Regions: this.state.Regions
        });
    }

    changeCurrent = CurrentRegionIdx => {
        if (this.state.CurrentRegionIdx !== CurrentRegionIdx) {
            this.setState({CurrentRegionIdx}, async () => {
                await this.saveRegions();
            });
        }
    }

    onServerAdd = row => {
        const {Regions} = this.state;
        Regions.push(row);
        this.setState({Regions}, async () => {
            await this.saveRegions();
        });
    }

    onServerEdit = (index, row) => {
        const {Regions} = this.state;
        Regions[index] = row;
        this.setState({Regions}, async () => {
            await this.saveRegions();
        });
    }

    onServerDelete = (index) => {
        const {Regions} = this.state;
        Regions.splice(index, 1);
        let CurrentRegionIdx = this.state.CurrentRegionIdx;
        if(!Regions[this.state.CurrentRegionIdx]) {
            CurrentRegionIdx = 0;
        }
        this.setState({Regions, CurrentRegionIdx}, async () => {
            await this.saveRegions();
        });
    }

    render() {
        return (
            <>
                <ModalWindow title="Serveurs privés" close={this.props.closeModal}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 'calc(100% - 150px)',
                        overflowY: 'auto'
                    }}>
                        <ul className="hover-effect" style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            listStyle: 'none'
                        }}>
                            {this.state.Regions.map((region, index) => (
                                <PrivateServer
                                    isOfficial={this.state.officialRegions.filter(reg => JSON.stringify(reg) === JSON.stringify(region)).length > 0}
                                    changeCurrent={this.changeCurrent} index={index}
                                    showEdit={this.showEdit} showDelete={this.showDelete}
                                    selected={this.state.CurrentRegionIdx === index} key={index} region={region}/>
                            ))}
                        </ul>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: 20
                    }}>
                        <Button onClick={this.showAddServer}
                                width={350}
                                height={60}
                                color={"#3b8616"}
                                hoverColor={"#5eb037"}
                                textColor="#FFFFFF"
                                hoverTextColor="#FFFFFF">
                            Ajouter un serveur
                        </Button>
                    </div>
                </ModalWindow>
                {this.state.showAddServer ? (
                    <AddPrivateServersModal addServer={this.onServerAdd} closeModal={this.hideAddServer}/>
                ) : null}
                {this.state.showEdit !== null ? (
                    <EditPrivateServersModal index={this.state.showEdit} server={this.state.Regions[this.state.showEdit]} editServer={this.onServerEdit} closeModal={this.hideEdit}/>
                ) : null}
                {this.state.showDelete !== null ? (
                    <DeletePrivateServers index={this.state.showDelete} server={this.state.Regions[this.state.showDelete]} deleteServer={this.onServerDelete} closeModal={this.hideDelete}/>
                ) : null}
            </>

        );
    }
}

class PrivateServer extends React.Component {

    parseName = _name => {
        const regex = /^<color=(#[a-f0-9]+)>(.*)<\/color>$/i;
        if (_name.match(regex)) {
            const [_, color, name] = regex.exec(_name);
            return {
                name, color
            }
        } else {
            return {
                name: _name,
                color: null
            };
        }
    }

    onClick = e => {
        this.props.changeCurrent(this.props.index);
    }

    onEditClick = e => {
        this.props.showEdit(this.props.index);
    }

    onDeleteClick = e => {
        this.props.showDelete(this.props.index);
    }

    render() {
        const nameData = this.parseName(this.props.region.Name);
        return (
            <>
                <ContextMenuTrigger id={this.props.index.toString()}>
                    <li onClick={this.onClick} style={{
                        padding: '10px 0 5px 8px',
                        borderLeft: this.props.selected ? 'solid 5px #2551a9' : null,
                        backgroundColor: this.props.selected ? 'rgba(37, 81, 169, 0.27)' : null,
                        cursor: this.props.selected ? null : 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div className="name" style={{
                                color: nameData.color,
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <div>{nameData.name}</div>
                            </div>
                            <div style={{fontSize: 12, display: 'flex', alignItems: 'center', height: 15}}>
                                <span style={{color: '#3d69bc'}}>{this.props.region.Fqdn}</span>
                                <div style={{fontWeight: 'bold', color: '#FFFFFF', margin: '0 3px'}}>:</div>
                                <span style={{color: '#6e6868'}}>{this.props.region.Port}</span>
                            </div>
                        </div>
                        <div>
                            {this.props.isOfficial ? (
                                <div style={{
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1px 4px',
                                    backgroundColor: '#3d7325',
                                    textTransform: 'uppercase',
                                    marginRight: 15
                                }}>
                                    Officiel
                                </div>
                            ) : null}
                            <div style={{width: 70, display: 'flex', justifyContent: 'center'}}>
                                {nameData.color ? (
                                    <div title="Couleur personnalisée" style={{
                                        height: 15,
                                        width: 15,
                                        borderRadius: '50%',
                                        backgroundColor: nameData.color,
                                        marginRight: 15
                                    }}/>
                                ) : null}
                            </div>
                        </div>
                    </li>
                </ContextMenuTrigger>
                {!this.props.isOfficial ? (
                    <ContextMenu id={this.props.index.toString()}>
                        <MenuItem onClick={this.onEditClick}>
                            Modifier <span style={{fontWeight: 'bold'}}>{nameData.name}</span>
                        </MenuItem>
                        <MenuItem onClick={this.onDeleteClick}>
                            <span className="danger">Supprimer <span style={{fontWeight: 'normal'}}>{nameData.name}</span></span>
                        </MenuItem>
                    </ContextMenu>
                ) : null}
            </>
        );
    }
}

export default PrivateServersModal;