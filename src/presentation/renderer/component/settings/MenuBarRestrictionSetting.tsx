import React = require('react');
import { useCases } from '../../remote';
import { MenuBarRestriction } from '../../../../domain/settings';

interface Props {
}

interface State {
    restricted: boolean
    maxCharacters: number | ''
}

const menuBarRestrictedCheckboxHtmlId = 'menuBarRestrictedCheckbox'

export class MenuBarRestrictionSetting extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            restricted: false,
            maxCharacters: 8,
        }
    }

    componentDidMount() {
        useCases.getMenuBarRestriction().then((restriction: MenuBarRestriction) => {
            console.log(`restriction: ${JSON.stringify(restriction)}`)
            this.setState({
                restricted: restriction.restricted,
                maxCharacters: restriction.maxCharacters,
            })
        })
    }

    handleOnMenuBarRestrictedChanged(e: React.ChangeEvent<HTMLInputElement>) {
        const restricted = e.target.checked
        useCases.setMenuBarRestricted(restricted)
            .then(() => {
                this.setState({ restricted })
            })
    }

    handleOnMaxCharacterChanged(e: React.ChangeEvent<HTMLInputElement>) {
        const maxCharacters = e.target.value !== '' ? Number(e.target.value) : ''
        this.setState({ maxCharacters })
    }

    handleMaxCharacterChangeStabled(maxCharacters: number) {
        console.log(`max character change stabled: ${maxCharacters}`)
        useCases.setMenuBarMaxCharacters(maxCharacters)
    }

    render() {
        return (
            <div className="ui form">
                <div className="field">
                    <div className="ui checkbox">
                        <input
                            id={menuBarRestrictedCheckboxHtmlId}
                            type="checkbox"
                            checked={this.state.restricted}
                            onChange={this.handleOnMenuBarRestrictedChanged.bind(this)}
                        />
                        <label
                            htmlFor={menuBarRestrictedCheckboxHtmlId}
                            style={{ cursor: 'pointer' }}>
                            Restrict the number of characters to display in the menu bar
                            </label>
                    </div>
                </div>
                <div className={"inline field" + (this.state.restricted ? '' : ' disabled')}>
                    <label>Maximum characters: </label>
                    <input
                        type="number"
                        min={0}
                        step={1}
                        style={{ width: 100, textAlign: 'right' }}
                        value={this.state.maxCharacters}
                        onBlur={e => this.handleMaxCharacterChangeStabled.call(this, e.target.value)}
                        onKeyPress={e => { if (e.key === 'Enter') { this.handleMaxCharacterChangeStabled.call(this, e.currentTarget.value) } }}
                        onChange={this.handleOnMaxCharacterChanged.bind(this)}
                    />
                </div>
            </div>
        )
    }
}
