import React = require("react");
import { TimeRecord } from "../../../domain/timeRecord";
import { useCases, remoteDay } from "../remote";
import { Day } from "../../../domain/day";
import { Task } from "../../../domain/task";

interface Props {
    day: Day
}

interface State {
    timeRecords: TimeRecord[]
    targetDay: Day
}

const TimeRecordElement = (props: { reducedTimeRecord: ReducedTimeRecord }) => {
    return (
        <div className="item">
            <div className="title">{props.reducedTimeRecord.task.name}</div>
            <div className="content">{toTimeString(props.reducedTimeRecord.totalTimeMillis)}</div>
        </div>
    )
}

export class TimeRecords extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            timeRecords: [],
            targetDay: this.props.day
        }
    }

    componentDidMount() {
        this.refreshTimeRecords(this.props.day)
    }

    refreshTimeRecords(day: Day) {
        // We have to create *remote* Day instance.
        // Because here is renderer process, but `getTimeRecords()` will be executed on main process.
        // If we don't do so, states of the day instance will be broken (maybe all instance fields become undefined).
        const obj = day.toObject()
        const rd = new remoteDay.Day(obj.year, obj.month, obj.day, obj.utcOffset)
        useCases.getTimeRecords(rd).then((timeRecords: TimeRecord[]) => {
            this.setState({ targetDay: day, timeRecords })
        })
    }

    handlePrevClick() {
        const prevDay = this.state.targetDay.addDay(-1)
        this.refreshTimeRecords(prevDay)
    }

    handleNextClick() {
        const nextDay = this.state.targetDay.addDay(1)
        this.refreshTimeRecords(nextDay)
    }

    renderTimeRecordElements() {
        if (this.state.timeRecords.length === 0) {
            return (
                <p className="item">No records found of this day.</p>
            )
        }
        return distinctReduce(this.state.timeRecords).map((reducedTimeRecord, i) => {
            return (
                <TimeRecordElement key={i} reducedTimeRecord={reducedTimeRecord} />
            )
        })
    }

    render() {
        return (
            <div>
                <div className="ui secondary three item menu">
                    <a className="left item" onClick={this.handlePrevClick.bind(this)}>
                        <i className="angle left icon"></i>
                    </a>
                    <div className="item">
                        {this.state.targetDay.toString()}
                    </div>
                    <a className="right item" onClick={this.handleNextClick.bind(this)}>
                        <i className="angle right icon"></i>
                    </a>
                </div>
                <div className="ui divided items">
                    {this.renderTimeRecordElements()}
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

interface ReducedTimeRecord {
    task: Task
    totalTimeMillis: number
    timeRecords: TimeRecord[]
}

function distinctReduce(records: TimeRecord[]): ReducedTimeRecord[] {
    const temp: Map<string, ReducedTimeRecord> = new Map()
    records.forEach(record => {
        if (!temp.has(record.task.id)) {
            temp.set(
                record.task.id,
                {
                    task: record.task,
                    totalTimeMillis: (record.endTime - record.startTime),
                    timeRecords: [record]
                }
            )
        } else {
            const r = temp.get(record.task.id)
            r.totalTimeMillis += (record.endTime - record.startTime)
            r.timeRecords.push(record)
        }
    })
    return Array.from(temp.values())
}