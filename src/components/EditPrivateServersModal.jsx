import React from "react";
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";
import {SketchPicker} from 'react-color';
import RegularExpressions from "../client/RegularExpressions";


class EditPrivateServersModal extends React.Component {
    state = {
        name: '',
        color: '#FFFFFF',
        host: '',
        ip: '',
        port: '22023',
        customColor: false,
        errors: {
            name: false,
            host: false,
            port: false,
            ip: false
        }
    }

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

    componentDidMount() {
        const nameData = this.parseName(this.props.server.Name);
        const data = {};
        data.name = nameData.name;
        if(nameData.color) {
            data.color = nameData.color;
            data.customColor = true;
        }
        data.host = this.props.server.Fqdn;
        data.ip = this.props.server.DefaultIp;
        data.port = this.props.server.Port;
        this.setState(data);
    }

    onSubmit = e => {
        if(Object.values(this.state.errors).filter(err => err).length === 0) {
            const data = {
                $type: "DnsRegionInfo, Assembly-CSharp",
                Fqdn: this.state.host,
                DefaultIp: this.state.ip,
                Port: Number.parseInt(this.state.port),
                Name: this.state.customColor ? `<color=${this.state.color}>${this.state.name}</color>` : this.state.name,
                TranslateName: 1003
            }
            this.props.editServer(this.props.index, data);
            this.props.closeModal();
        }
    }

    onNameChange = e => {
        const {errors} = this.state;
        errors.name = e.target.value === '';
        this.setState({name: e.target.value, errors});
    };
    onHostChange = e => {
        const {errors} = this.state;
        errors.host = !e.target.value.match(RegularExpressions.HOSTNAME);
        this.setState({host: e.target.value, errors});
    }
    onIPChange = e => {
        const {errors} = this.state;
        errors.ip = !e.target.value.match(RegularExpressions.IP_ADDRESS);
        this.setState({ip: e.target.value});
    }
    onPortChange = e => {
        const {errors} = this.state;
        errors.port = !e.target.value.match(RegularExpressions.PORT);
        this.setState({port: e.target.value});
    }
    onColorChange = e => this.setState({color: e.hex});
    toggleCustomColor = e => this.setState({customColor: !this.state.customColor});

    render() {
        return (
            <ModalWindow title="Modifier un serveur privé" close={this.props.closeModal}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 'calc(100% - 130px)'
                }}>
                    <div style={{width: '95%'}}>
                        <div>
                            <label className="label-text" htmlFor="name">Nom de la région :</label>
                        </div>
                        <div>
                            <input style={{border: this.state.errors.name ? 'solid 1px #FF0000' : null}} id="name" placeholder="Mon serveur privé" onChange={this.onNameChange} type="text"
                                   className="input-text" value={this.state.name}/>
                        </div>
                    </div>
                    <div style={{width: '95%'}}>
                        <div>
                            <label className="label-text" htmlFor="host">Nom d'hôte :</label>
                        </div>
                        <div>
                            <input style={{border: this.state.errors.host ? 'solid 1px #FF0000' : null}} id="host" placeholder="mon-serveur.exemple.fr" onChange={this.onHostChange}
                                   type="text" className="input-text" value={this.state.host}/>
                        </div>
                    </div>
                    <div style={{width: '95%'}}>
                        <div>
                            <label className="label-text" htmlFor="ip">Adresse IP :</label>
                        </div>
                        <div>
                            <input style={{border: this.state.errors.ip ? 'solid 1px #FF0000' : null}} id="ip" placeholder="127.0.0.1" onChange={this.onIPChange} type="text"
                                   className="input-text" value={this.state.ip}/>
                        </div>
                    </div>
                    <div style={{width: '95%'}}>
                        <div>
                            <label className="label-text" htmlFor="port">Port :</label>
                        </div>
                        <div>
                            <input style={{border: this.state.errors.port ? 'solid 1px #FF0000' : null}} id="port" placeholder="22023" onChange={this.onPortChange} type="text"
                                   className="input-text" value={this.state.port}/>
                        </div>
                    </div>
                    <div className="advanced">
                        <div className="advanced-selector" onClick={this.toggleCustomColor} style={{marginLeft: 8}}>
                            {this.state.customColor ? (
                                <>
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                         viewBox="0 0 459 459">
                                        <path d="M124.95,181.05l-35.7,35.7L204,331.5l255-255l-35.7-35.7L204,260.1L124.95,181.05z M408,408H51V51h255V0H51
			C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51V204h-51V408z"/>
                                    </svg>
                                    Utiliser une couleur personnalisée
                                </>
                            ) : (
                                <>
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px"
                                         y="0px" viewBox="0 0 459 459">
                                            <path d="M408,51v357H51V51H408 M408,0H51C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357c28.05,0,51-22.95,51-51V51
                                                C459,22.95,436.05,0,408,0L408,0z"/>
                                    </svg>
                                    Utiliser une couleur personnalisée
                                </>
                            )}
                        </div>
                        <div className="advanced-content" style={{
                            opacity: this.state.customColor ? '1' : '0',
                            marginBottom: 20,
                            display: 'flex',
                            justifyContent: 'space-evenly',
                            alignItems: 'center',
                            flexDirection: 'row'
                        }}>
                            <div>
                                <SketchPicker color={this.state.color} onChangeComplete={this.onColorChange}
                                              disableAlpha styles={{backgroundColor: 'transparent'}}/>
                            </div>
                            <div style={{
                                backgroundColor: this.state.color,
                                height: 50,
                                width: 50,
                                borderRadius: '50%',
                                border: 'solid 5px #FFFFFF'
                            }}/>
                        </div>
                    </div>
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
                        Enregistrer
                    </Button>
                </div>
            </ModalWindow>
        );
    }
}

export default EditPrivateServersModal;