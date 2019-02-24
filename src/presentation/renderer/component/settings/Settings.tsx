import React = require('react');
import { StorageSetting } from './StorageSetting';

interface State {
    restrictMenuBarCharacters: boolean
}

interface Props {
}

export class Settings extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            restrictMenuBarCharacters: true
        }
    }

    handleRestrictMenuBarCharacters() {
        this.setState({
            restrictMenuBarCharacters: !this.state.restrictMenuBarCharacters
        })
    }

    render() {
        return (
            <div className="ui basic segment">
                <StorageSetting />
                <h3 className="ui dividing header">Menu bar</h3>
                <div className="ui form">
                    <div className="field">
                        <div className="ui checkbox" onClick={this.handleRestrictMenuBarCharacters.bind(this)}>
                            <input type="checkbox" name="foo" checked={this.state.restrictMenuBarCharacters} onChange={e => this.setState({ restrictMenuBarCharacters: e.target.checked })} />
                            <label style={{ cursor: 'pointer' }}>
                                Restrict the number of characters to display in the menu bar
                            </label>
                        </div>
                    </div>
                    <div className="inline field">
                        <label>Maximum characters: </label>
                        <input type="number" min={0} step={1} style={{ width: 100 }} />
                    </div>
                </div>
            </div>
        )
    }
}
