import React = require("react");
import { TimeRecord } from "../../timeRecord";
import { useCases } from "../remote";
import { Day, dayToString, dayToMillis, millisToDay } from "../../day";
import { Task } from "../../task";

interface Props {
    day: Day
}

interface State {
    timeRecords: TimeRecord[]
    targetDay: Day
}

const TimeRecordElement = (props: { reducedTimeRecord: ReducedTimeRecord }) => {
    return (
        <dl>
            <dt>{props.reducedTimeRecord.task.name}</dt>
            <dd>{toTimeString(props.reducedTimeRecord.totalTimeMillis)}</dd>
        </dl>
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
        useCases.getTimeRecords(day).then((timeRecords: TimeRecord[]) => {
            this.setState({ targetDay: day, timeRecords })
        })
    }

    handlePrevClick() {
        const prevDay = millisToDay(dayToMillis(this.state.targetDay) - 86400000)
        this.refreshTimeRecords(prevDay)
    }

    handleNextClick() {
        const nextDay = millisToDay(dayToMillis(this.state.targetDay) + 86400000)
        this.refreshTimeRecords(nextDay)
    }

    renderTimeRecordElements() {
        if (this.state.timeRecords.length === 0) {
            return (
                <p>No records found of this day.</p>
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
                <p>
                    <button onClick={this.handlePrevClick.bind(this)}>&lt;</button>
                    {dayToString(this.state.targetDay)}
                    <button onClick={this.handleNextClick.bind(this)}>&gt;</button>
                </p>
                {this.renderTimeRecordElements()}
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