import React = require('react');
import { useCases, dialog, relaunch, getCurrentWindow } from "../../remote";
import { StoragePath } from '../../../../domain/settings';

interface State {
    editMode: boolean
    saving: boolean
    editorPath: string
}

interface Props {
}

export class StorageSetting extends React.Component<Props, State> {

    private storagePath: string

    constructor(props: Props) {
        super(props)
        this.state = {
            editMode: false,
            saving: false,
            editorPath: 'Loading settings...',
        }
    }

    componentDidMount() {
        useCases.getStoragePath().then((storagePath: StoragePath) => {
            this.storagePath = storagePath.absolutePath
            this.setState({ editorPath: this.storagePath })
        })
    }

    handleChangeClick() {
        this.setState({
            editMode: true
        })
    }

    handleBrowseClick() {
        dialog.showOpenDialog(getCurrentWindow(), {
            defaultPath: this.state.editorPath,
            properties: ['openDirectory']
        }, filePaths => {
            this.setState({ editorPath: filePaths[0] })
        })
    }

    handleSaveClick() {
        dialog.showMessageBox(getCurrentWindow(), {
            message: `If you change the storage path, the app will be restarted. \n\nAre you sure?`,
            buttons: ['Yes, Change and Restart', 'Cancel'],
            cancelId: 1,
        }, response => {
            if (response === 0) {
                this.setState({ saving: true })
                useCases.setStoragePath(this.state.editorPath, false)
                    .then(() => {
                        relaunchApp()
                    })
            }
        })
    }

    handleCancelClick() {
        this.setState({
            editMode: false,
            saving: false,
            editorPath: this.storagePath,
        })
    }

    render() {
        return (
            <div className={"ui form" + (this.state.saving ? " loading" : "")}>
                <div className="field">
                    <label>
                        The path to the directory where save data to
                        </label>
                    <div className={"ui input" + (this.state.editMode ? " action" : " disabled")}>
                        <input
                            type="text"
                            value={this.state.editorPath}
                            onChange={e => this.setState({ editorPath: e.target.value })}
                            placeholder="Path to your storage"
                            readOnly={!this.state.editMode} />
                        {
                            this.state.editMode && <button className="ui button" onClick={this.handleBrowseClick.bind(this)}>Browse...</button>
                        }
                    </div>
                </div>
                {
                    this.state.editMode
                        ? (
                            <div className="field">
                                <button className="ui teal button" onClick={this.handleSaveClick.bind(this)}>Save</button>
                                <button className="ui button" onClick={this.handleCancelClick.bind(this)}>Cancel</button>
                            </div>
                        )
                        : (
                            <div className="field">
                                <button className="ui button" onClick={this.handleChangeClick.bind(this)}>Change the storage path</button>
                            </div>
                        )
                }
            </div>
        )
    }
}

function relaunchApp() {
    relaunch()
}
