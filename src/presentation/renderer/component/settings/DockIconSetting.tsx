import React = require('react');
import { useCases } from '../../remote';

interface State {
    checked: boolean
}

interface Props {
}

const checkboxHtmlId = 'dockIconVisibilityCheckbox'

export class DockIconSetting extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            checked: false
        }
    }

    componentDidMount() {
        useCases.isDockIconVisible()
            .then((visible: boolean) => {
                this.setState({ checked: visible })
            })
    }

    handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
        const checked = e.target.checked
        useCases.setDockIconVisibility(checked)
            .then(() => {
                this.setState({ checked })
            })
    }

    render() {
        return (
            <div className="ui form">
                <div className="field">
                    <div className="ui checkbox">
                        <input
                            id={checkboxHtmlId}
                            type="checkbox"
                            checked={this.state.checked}
                            onChange={this.handleOnChange.bind(this)}
                        />
                        <label
                            htmlFor={checkboxHtmlId}
                            style={{ cursor: 'pointer' }}>
                            Show the app icon in the dock always
                        </label>
                    </div>
                </div>
            </div>
        )
    }
}
