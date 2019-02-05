import React = require("react");
import { TimeRecord, compareTimeRecord } from "../../../domain/timeRecord";
import { useCases, remoteDay } from "../remote";
import { Day } from "../../../domain/day";
import { TimeRecordView, TimeRecordViewModel } from "./TimeRecordView";
import { compareTask } from "../../../domain/task";

interface Props {
    day: Day
}

interface State {
    targetDay: Day
    timeRecordViewModels: TimeRecordViewModel[]
}

export class TimeRecordsView extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            timeRecordViewModels: [],
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
            const timeRecordViewModels = getTimeRecordViewModels(timeRecords)
            this.setState({ targetDay: day, timeRecordViewModels })
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

    handleOnTimeRecordEdit(newTimeRecord: TimeRecord) {
        useCases.updateTimeRecord(newTimeRecord).then(() => {
            this.refreshTimeRecords(this.state.targetDay)
        })
    }

    handleOnTimeRecordDelete(timeRecord: TimeRecord) {
        useCases.deleteTimeRecord(timeRecord.id).then(() => {
            this.refreshTimeRecords(this.state.targetDay)
        })
    }

    renderTimeRecordElements() {
        if (this.state.timeRecordViewModels.length === 0) {
            return (
                <div className="item">
                    <div className="ui center aligned basic segment">
                        No records found of this day.
                    </div>
                </div>
            )
        }
        return this.state.timeRecordViewModels.map(viewModel => {
            return (
                <TimeRecordView
                    key={viewModel.task.id}
                    viewModel={viewModel}
                    targetDay={this.state.targetDay}
                    onTimeRecordEdit={this.handleOnTimeRecordEdit.bind(this)}
                    onTimeRecordDelete={this.handleOnTimeRecordDelete.bind(this)}
                />
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

function getTimeRecordViewModels(timeRecords: TimeRecord[]): TimeRecordViewModel[] {
    const map: Map<string, TimeRecordViewModel> = new Map()
    for (var i = 0, len = timeRecords.length; i < len; i++) {
        const record = timeRecords[i]
        if (!map.has(record.task.id)) {
            const viewModel: TimeRecordViewModel = { task: record.task, items: [], totalTimeMillis: 0 }
            map.set(record.task.id, viewModel)
        }
        const viewModel = map.get(record.task.id)
        viewModel.items.push(record)
        viewModel.totalTimeMillis += (record.endTime - record.startTime)
    }
    const viewModels = Array.from(map.values())
    viewModels.sort((a, b) => {
        return compareTask(a.task, b.task)
    })
    viewModels.forEach(viewModel => {
        viewModel.items.sort(compareTimeRecord)
    })
    return viewModels
}