import React = require("react");
import { TimeRecord } from "../../../domain/timeRecord";
import { Day } from "../../../domain/day";

interface EditorProps {
    time: number
    day: Day
}

interface EditorState {
    editingText: string
}

/*
 * [NOTE]
 * If endTime represents the day after startTime, the endTime will be represented as
 * elapsed time from 00:00:00 on the day of startTime.
 * For instance, if startTime is `2019-01-01T12:00:00` and endTime is `2019-01-02T01:00:00`,
 * startTime will be `12:00:00` and endTime will be `25:00:00` since
 * `2019-01-02T01:00:00` can be considered to `2019-01-01T25:00:00`.
 */
class TimeEditor extends React.Component<EditorProps, EditorState> {

    private inputElement: React.RefObject<HTMLInputElement> = React.createRef()

    constructor(props: EditorProps) {
        super(props)
        this.state = {
            editingText: toSecondsClockString(props.time, props.day)
        }
    }

    public validate(): boolean {
        return this.inputElement.current.reportValidity()
    }

    public getMillis(): number {
        return toMillisFromClockString(this.state.editingText, this.props.day)
    }

    render() {
        return (
            <input
                ref={this.inputElement}
                type="text"
                pattern="^[0-9]{2,}:[0-9]{2}:[0-9]{2}$" // See NOTE comment of this class
                size={8}
                onChange={e => this.setState({ editingText: e.target.value })}
                value={this.state.editingText}
                placeholder={toSecondsClockString(this.props.time, this.props.day)}
            />
        )
    }
}

interface Props {
    timeRecord: TimeRecord
    targetDay: Day
    onEdit: (newRecord: TimeRecord) => void
    onDelete: (record: TimeRecord) => void
}

interface State {
    hover: boolean
    editMode: boolean
}

export class TimeRecordDetailView extends React.Component<Props, State> {

    private startTimeEditor: React.RefObject<TimeEditor> = React.createRef()
    private endTimeEditor: React.RefObject<TimeEditor> = React.createRef()

    constructor(props: Props) {
        super(props)
        this.state = {
            hover: false,
            editMode: false,
        }
    }

    handleEditClick() {
        if (!this.startTimeEditor.current.validate()
            || !this.endTimeEditor.current.validate()) {
            return
        }
        this.props.onEdit({
            ...this.props.timeRecord,
            startTime: this.startTimeEditor.current.getMillis(),
            endTime: this.endTimeEditor.current.getMillis(),
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
                <TimeEditor
                    ref={this.startTimeEditor}
                    time={this.props.timeRecord.startTime}
                    day={this.props.targetDay}
                />
                {' - '}
                <TimeEditor
                    ref={this.endTimeEditor}
                    time={this.props.timeRecord.endTime}
                    day={this.props.targetDay}
                />
                {' '}
                <button className="ui mini teal icon button" onClick={this.handleEditClick.bind(this)}>
                    {/* I know `icon button` is misuse but it looks to fit this UI. */}
                    Save
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
                    <span title={toSecondsClockString(this.props.timeRecord.startTime, this.props.targetDay)}>
                        {toClockString(this.props.timeRecord.startTime, this.props.targetDay)}
                    </span>
                    {' - '}
                    <span title={toSecondsClockString(this.props.timeRecord.endTime, this.props.targetDay)}>
                        {toClockString(this.props.timeRecord.endTime, this.props.targetDay)}
                    </span>
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

// NOTE
// Clock means the time of the day, Time means the elapsed time from specific time.

function toTimeString(millis: number): string {
    const hours = Math.floor(millis / 3600000)
    const minutes = Math.floor((millis % 3600000) / 60000)
    const seconds = Math.floor((millis % 60000) / 1000)
    const hoursString = String(hours).length === 1
        ? '0' + hours
        : String(hours)
    return `${hoursString}:${('00' + minutes).slice(-2)}:${('00' + seconds).slice(-2)}`
}

function toMillisFromClockString(clockString: string, day: Day): number {
    const hms = clockString.split(':')
    const hours = Number(hms[0]) || 0
    const minutes = Number(hms[1]) || 0
    const seconds = Number(hms[2]) || 0
    return day.toMillis() + (hours * 3600000) + (minutes * 60000) + (seconds * 1000)
}

function toClockString(millis: number, day: Day): string {
    const str = toSecondsClockString(millis, day)
    return str.substring(0, str.lastIndexOf(':'))
}

function toSecondsClockString(millis: number, day: Day): string {
    // This function returns the elapsed time from 00:00:00 of the specified day.
    // For instance, if `millis` represents 2019-01-02T01:00:00 and `day` represents 2019-01-01,
    // this returns `25:00:00` because 2019-01-02T01:00:00 is 25 hours later than 2019-01-01T00:00:00.
    const offsetMillis = day.toMillis() // this is the unix-epoc millis of the day at 00:00:00
    const deltaMillis = millis - offsetMillis
    return toTimeString(deltaMillis)
}
