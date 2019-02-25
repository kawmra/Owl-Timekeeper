import React = require('react');
import { StorageSetting } from './StorageSetting';
import { MenuBarRestrictionSetting } from './MenuBarRestrictionSetting';

interface State {
}

interface Props {
}

export class Settings extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {}
    }

    render() {
        return (
            <div className="ui basic segment">
                <h3 className="ui dividing header">Storage</h3>
                <StorageSetting />
                <h3 className="ui dividing header">Menu bar</h3>
                <MenuBarRestrictionSetting />
            </div>
        )
    }
}
