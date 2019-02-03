import React = require("react");
import { TasksView } from "./TasksView";
import { TimeRecordsView } from "./TimeRecordsView";
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
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="ui inverted attached borderless labeled icon three item menu"
                    style={{ backgroundColor: '#003366' }}>
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
                <div className="no-scrollbar ui padded basic container segment"
                    style={{ flex: 1, overflow: 'auto' }}>
                    <div style={visibility.call(this, Page.TASKS)}>
                        <TasksView />
                    </div>
                    <div style={visibility.call(this, Page.TIME_RECORDS)}>
                        <TimeRecordsView day={Day.today()} />
                    </div>
                </div>
            </div>
        )
    }
}