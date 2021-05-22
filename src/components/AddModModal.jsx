import React from "react";
import {SystemController} from "../client/system";
import ModalWindow from "./ModalWindow.jsx";
import Button from "./Parts/Button.jsx";
import GithubIcon from "./Icons/GithubIcon.jsx";

class AddModModal extends React.Component {
    state = {
        url: '',
        error: false,
        error2: false
    }

    inputRef = React.createRef();

    componentDidMount() {
        this.inputRef.current.focus();
    }

    checkIfModExists = async repo => {
        const mods = await SystemController.getMods();
        const [exist] = mods.filter(m => m.repo.toLowerCase() === repo.toLowerCase());
        return !!exist;

    }

    onUrlChange = async e => {
        const regex = /^https:\/\/github.com\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})$/i;
        this.setState({url: e.target.value, error: !e.target.value.match(regex)});
    }

    onSubmit = async () => {
        if (this.state.error === false && this.state.url !== '') {
            if (await this.checkIfModExists(this.state.url)) {
                this.setState({error2: true});
            } else {
                this.props.onSubmit(this.state.url);
                this.props.closeModal();
            }
        }
    }

    render() {
        return (
            <ModalWindow title="Ajouter un mod" close={this.props.closeModal}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 'calc(100% - 150px)'
                }}>
                    <div className="big-icon">
                        <GithubIcon/>
                    </div>
                    <div style={{padding: '0 20px', textAlign: 'center'}}>
                        Veuillez saisir l'URL du dépôt Github d'un mod <span style={{fontWeight: 'bold'}}>Among Us</span>
                    </div>
                    <div style={{width: '100%'}}>
                        <label className="label-text" htmlFor="git-repo">
                            URL du dépôt :
                        </label>
                        <input ref={this.inputRef} className={"input-text" + (this.state.error ? ' error' : '')} value={this.state.url}
                               onChange={this.onUrlChange} placeholder="https://github.com/clicpanel/among-us-mods"
                               id="git-repo" type="text"/>
                        {this.state.error ?
                            <p className="error">L'URL du dépôt doit être une URL de dépôt Github valide.</p> : (
                                this.state.error2 ? <p className="error">Vous avez déjà ajouté ce mod sur <span style={{fontWeight: 'bold'}}>Among Us Mods</span>.</p> : null
                            )}
                    </div>
                    <Button onClick={this.onSubmit}
                            width={350}
                            height={60}
                            color={"#3b8616"}
                            hoverColor={"#5eb037"}
                            textColor="#FFFFFF"
                            hoverTextColor="#FFFFFF">
                        Continuer
                    </Button>
                </div>
            </ModalWindow>
        );
    }
}

export default AddModModal;