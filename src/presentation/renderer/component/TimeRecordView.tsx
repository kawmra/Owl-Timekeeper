import React = require("react");
import { TimeRecordDetailView } from "./TimeRecordDetailView";
import { Task } from "../../../domain/task";
import { TimeRecord } from "../../../domain/timeRecord";

interface Props {
    viewModel: TimeRecordViewModel
}

interface State {
    open: boolean
}

export interface TimeRecordViewModel {
    task: Task
    totalTimeMillis: number
    items: TimeRecord[]
}

export class TimeRecordView extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            open: false
        }
    }

    handleAccordionClick() {
        this.setState({ open: !this.state.open })
    }

    handleRecordOnEdit() {
    }

    handleRecordOnDelete() {
    }

    renderRecords() {
        return this.props.viewModel.items.map((record, i) => {
            return (
                <TimeRecordDetailView
                    key={i}
                    timeRecord={record}
                    onEdit={this.handleRecordOnEdit.bind(this)}
                    onDelete={this.handleRecordOnDelete.bind(this)}
                />
            )
        })
    }

    render() {
        function active() {
            return this.state.open ? ' active' : ''
        }
        return (
            <div className="item">
                <div className="ui grid">
                    <div className="row">
                        <div className="eight wide column">
                            <div style={{ margin: '0.5em 0' }}>{this.props.viewModel.task.name}</div>
                        </div>
                        <div className="eight wide right aligned column">
                            <div className="ui accordion">
                                <div className={'title' + active.call(this)} onClick={this.handleAccordionClick.bind(this)}>
                                    <i className="dropdown icon"></i>
                                    {toTimeString(this.props.viewModel.totalTimeMillis)}
                                </div>
                                <div className={'content' + active.call(this)}>
                                    <div className="ui list">
                                        {this.renderRecords.call(this)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function toTimeString(millis: number): string {
    const seconds = millis / 1000
    const h = Math.floor(seconds / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 60)
    var str = ""
    if (h !== 0) str += `${h}h `
    if (m !== 0) str += `${m}m `
    if (s !== 0) str += `${s}s`
    return str
}
