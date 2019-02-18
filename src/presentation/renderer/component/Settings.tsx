import React = require('react');

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
                <div className="ui form">
                    <h3 className="ui dividing header">Storage</h3>
                    <div className="field">
                        <label>The path to storage</label>
                        <div className="ui action input">
                            <input type="text" placeholder="Path to your storage" />
                            <button className="ui button">Browse...</button>
                        </div>
                    </div>
                    <h3 className="ui dividing header">Menu bar</h3>
                    <div className="field">
                        <div className="ui checkbox" onClick={this.handleRestrictMenuBarCharacters.bind(this)}>
                            <input type="checkbox" name="foo" checked={this.state.restrictMenuBarCharacters} />
                            <label style={{ cursor: 'pointer' }}>Restrict the number of characters to display in the menu bar</label>
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
