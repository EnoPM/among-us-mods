import React from "react";
import {SystemController} from "../client/system";
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";

class PrivateServersModal extends React.Component {
    state = {
        Regions: [],
        CurrentRegionIdx: 0
    }

    componentDidMount() {
        SystemController.getRegions().then(regions => {
            this.setState(regions);
            console.log(regions);
        });
    }

    changeCurrent = CurrentRegionIdx => {
        this.setState({CurrentRegionIdx}, async () => {
            await SystemController.setRegions({
                CurrentRegionIdx,
                Regions: this.state.Regions
            });
        });

    }

    render() {
        return (
            <ModalWindow title="Serveurs privés" close={this.props.closeModal}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 'calc(100% - 130px)'
                }}>
                    <ul style={{width: '100%', padding: '0 10px', boxSizing: 'border-box', listStyle: 'none'}}>
                        {this.state.Regions.map((region, index) => <PrivateServer changeCurrent={this.changeCurrent} index={index} selected={this.state.CurrentRegionIdx === index} key={index} region={region}/>)}
                    </ul>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <Button onClick={this.onSubmit}
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
        );
    }
}

class PrivateServer extends React.Component {

    parseName = _name => {
        const regex = /^<color=(#[a-f0-9]+)>(.*)<\/color>$/i;
        if(_name.match(regex)) {
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

    render() {
        const nameData = this.parseName(this.props.region.Name);
        return (
            <li onClick={this.onClick} style={{
                margin: '5px 0',
                padding: '5px 0 5px 8px',
                borderLeft: this.props.selected ? 'solid 5px #2551a9' : null,
                backgroundColor: this.props.selected ? 'rgba(37, 81, 169, 0.27)' : null,
                cursor: this.props.selected ? null : 'pointer'
            }}>
                <div className="name" style={{color: nameData.color, fontWeight: 'bold'}}>
                    {nameData.name}
                </div>
                <div style={{fontSize: 12}}>
                    {this.props.region.Fqdn}:{this.props.region.Port}
                </div>
            </li>
        );
    }
}

export default PrivateServersModal;