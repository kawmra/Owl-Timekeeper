import React = require("react");
import { ReducedTimeRecord } from "./ReducedTimeRecord";
import moment = require("moment");

interface Props {
    reducedTimeRecord: ReducedTimeRecord
}

interface State {
    open: boolean
}

export class TimeRecordElement extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            open: false
        }
    }

    handleAccordionClick() {
        this.setState({ open: !this.state.open })
    }

    renderRecords() {
        return this.props.reducedTimeRecord.timeRecords.map((record, i) => {
            return (
                <div className="disabled item" key={i}>
                    {toClockString(record.startTime)}
                    {' - '}
                    {toClockString(record.endTime)}
                </div>
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
                            <div style={{ margin: '0.5em 0' }}>{this.props.reducedTimeRecord.task.name}</div>
                        </div>
                        <div className="eight wide right aligned column">
                            <div className="ui accordion" onClick={this.handleAccordionClick.bind(this)}>
                                <div className={'title' + active.call(this)}>
                                    <i className="dropdown icon"></i>
                                    {toTimeString(this.props.reducedTimeRecord.totalTimeMillis)}
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

function toClockString(millis: number): string {
    return moment(millis).format('HH:mm:ss')
}
