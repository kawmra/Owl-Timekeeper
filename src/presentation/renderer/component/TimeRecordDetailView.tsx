import React = require("react");
import { TimeRecord } from "../../../domain/timeRecord";
import moment = require("moment");
import { Task } from "../../../domain/task";

interface Props {
    timeRecord: TimeRecord
    onEdit: (newRecord: TimeRecord) => void
    onDelete: (record: TimeRecord) => void
}

interface State {
    hover: boolean
    editMode: boolean
    editingStartText: string
    editingEndText: string
}

const TimeEditor = (props: { timeText: string, onChange: (newText: string) => void }) => {
    return (
        <input
            type="text"
            pattern="^[0-9]{2}:[0-9]{2}:[0-9]{2}$"
            size={8}
            onChange={e => props.onChange(e.target.value)}
            value={props.timeText}
            placeholder={props.timeText} />
    )
}

export class TimeRecordDetailView extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            hover: false,
            editMode: false,
            editingStartText: toSecondsClockString(this.props.timeRecord.startTime),
            editingEndText: toSecondsClockString(this.props.timeRecord.endTime),
        }
    }

    handleEditClick() {
        this.props.onEdit({
            ...this.props.timeRecord,
            startTime: 0,
            endTime: 0,
        })
        this.setState({
            editMode: false
        })
    }

    handleDeleteClick() {
        this.props.onDelete(this.props.timeRecord)
    }

    renderEditor() {
        return (
            <div className="item ui mini input">
                <TimeEditor timeText={this.state.editingStartText} onChange={newText => this.setState({ editingStartText: newText })} />
                {' - '}
                <TimeEditor timeText={this.state.editingEndText} onChange={newText => this.setState({ editingEndText: newText })} />
                {' '}
                <button className="ui mini teal icon button" onClick={this.handleEditClick.bind(this)}>
                    <i className="check icon" />
                </button>
                <p>or <a href="#" onClick={() => this.setState({ editMode: false })}>Cancel</a></p>
            </div>
        )
    }

    renderNormal() {
        return (
            <div className="disabled item" style={{ pointerEvents: 'unset' }} onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
                <p>
                    <span style={{ display: this.state.hover ? "unset" : "none" }}>
                        <i className="link edit icon" onClick={() => { this.setState({ editMode: true }) }} />
                        <i className="link trash icon" onClick={this.handleDeleteClick.bind(this)} />
                    </span>
                    <span title={toSecondsClockString(this.props.timeRecord.startTime)}>{toClockString(this.props.timeRecord.startTime)}</span>
                    {' - '}
                    <span title={toSecondsClockString(this.props.timeRecord.endTime)}>{toClockString(this.props.timeRecord.endTime)}</span>
                </p>
            </div>
        )
    }

    render() {
        return this.state.editMode
            ? this.renderEditor()
            : this.renderNormal()
    }
}

function toClockString(millis: number): string {
    return moment(millis).format('HH:mm')
}

function toSecondsClockString(millis: number): string {
    return moment(millis).format('HH:mm:ss')
}
