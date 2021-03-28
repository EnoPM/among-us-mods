import React from "react";

class AddModModal extends React.Component {
    state = {
        url: '',
        error: false
    }

    inputRef = React.createRef();

    componentDidMount() {
        this.inputRef.current.focus();
    }

    onUrlChange = e => {
        const regex = /^https:\/\/github.com\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})$/i;
        this.setState({url: e.target.value, error: !e.target.value.match(regex)});
    }

    onSubmit = () => {
        if(this.state.error === false && this.state.url !== '') {
            this.props.onSubmit(this.state.url);
            this.props.closeModal();
        }
    }

    render() {
        return (
            <div className="overlay">
                <div className="modal modal-add-mod">
                    <div className="title">
                        Ajouter un mod
                    </div>
                    <label htmlFor="git-repo">
                        URL du dépôt :
                    </label>
                    <input ref={this.inputRef} className={this.state.error ? 'error' : ''} value={this.state.url} onChange={this.onUrlChange} placeholder="https://github.com/clicpanel/among-us-mods" id="git-repo" type="text"/>
                    {this.state.error ? <p className="error">L'URL du dépôt doit être une URL de dépôt Github valide.</p> : null}
                    <div className="buttons">
                        <button className="btn cancel" onClick={this.props.closeModal}>
                            Annuler
                        </button>
                        <button className="btn success" onClick={this.onSubmit}>
                            Installer le mod
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddModModal;