import React = require("react");
import { Tasks } from "./Task";
import { TimeRecords } from "./TimeRecord";
import { Day } from "../../../domain/day";

enum Page {
    TASKS,
    TIME_RECORDS,
    SETTINGS,
}

interface Props { }
interface State {
    page: Page
}

export class App extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            page: Page.TASKS
        }
    }

    switchPage(page: Page) {
        this.setState({ page })
    }

    render() {
        function active(page: Page): string {
            return page == this.state.page ? ' active' : ''
        }
        function visibility(page: Page): React.CSSProperties {
            return page == this.state.page ? { display: 'block' } : { display: 'none' }
        }
        return (
            <div>
                <div className="ui borderless pointing labeled icon three item menu">
                    <a className={"item" + active.call(this, Page.TASKS)} onClick={this.switchPage.bind(this, Page.TASKS)}>
                        <i className="tasks icon"></i>
                        Tasks
                    </a>
                    <a className={"item" + active.call(this, Page.TIME_RECORDS)} onClick={this.switchPage.bind(this, Page.TIME_RECORDS)}>
                        <i className="clock outline icon"></i>
                        Time Records
                    </a>
                    <a className={"right item" + active.call(this, Page.SETTINGS)} onClick={this.switchPage.bind(this, Page.SETTINGS)}>
                        <i className="cog icon"></i>
                        Settings
                    </a>
                </div>
                <div className="ui padded basic container segment">
                    <div style={visibility.call(this, Page.TASKS)}>
                        <Tasks />
                    </div>
                    <div style={visibility.call(this, Page.TIME_RECORDS)}>
                        <TimeRecords day={Day.today()} />
                    </div>
                </div>
            </div>
        )
    }
}