import React = require('react');
import { StorageSetting } from './StorageSetting';
import { MenuBarRestrictionSetting } from './MenuBarRestrictionSetting';
import { DockIconSetting } from './DockIconSetting';

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
                <h3 className="ui dividing header">Menu Bar</h3>
                <MenuBarRestrictionSetting />
                <h3 className="ui dividing header">Dock Icon</h3>
                <DockIconSetting />
            </div>
        )
    }
}
