import React = require("react")
import {remoteDay, useCases} from "../remote";
import {Day} from "../../../domain/day";
import {TimeRecord} from "../../../domain/timeRecord";
import {ChangeEvent, FC, useCallback, useEffect, useMemo, useState} from "react";

interface Props {
}

export const Stats: FC<Props> = (props) => {
    const [fromDayStr, setFromDayStr] = useState(Day.today().toString());
    const [toDayStr, setToDayStr] = useState(Day.today().toString());
    const [records, setRecords] = useState<TimeRecord[]>([]);

    const handleFromDayChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        console.log("fromDay", e.target.value)
        setFromDayStr(e.target.value)
    }, []);

    const handleToDayChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        console.log("toDay", e.target.value)
        setToDayStr(e.target.value)
    }, []);

    const handleSubmit = useCallback(() => {
        const from = parseRemoteDay(fromDayStr)
        const to = parseRemoteDay(toDayStr)
        if (from === undefined || to === undefined) {
            return
        }
        console.log("submit", from, to)
        useCases.getTimeRecords(from, to)
            .then((records: TimeRecord[]) => {
                console.log("records", records)
                setRecords(records)
            })
    }, [fromDayStr, toDayStr])

    const stats = useMemo(() => {
        return calcStats(records)
    }, [records])

    return (
        <div>
            <input type="date" value={fromDayStr} onChange={handleFromDayChange} />
            <span> ~ </span>
            <input type="date" value={toDayStr} onChange={handleToDayChange} />
            <button onClick={handleSubmit}>submit</button>
            {stats.map((stat: TaskStats) => {
                return (
                    <div key={stat.taskId}>
                        {stat.taskName} ({formatTime(stat.time)})
                    </div>
                )
            })}
        </div>
    )
}

function parseRemoteDay(dayStr: string): Day | undefined {
    const [year, month, day] = dayStr.split("-")
    if (year === undefined || month === undefined || day === undefined) {
        return undefined
    }
    return new remoteDay.Day(parseInt(year), parseInt(month) - 1, parseInt(day))
}

type TaskStats = {
    taskId: string
    taskName: string
    time: number
}

function calcStats(records: TimeRecord[]): TaskStats[] {
    const stats: TaskStats[] = []
    records.forEach(record => {
        const found = stats.find(it => it.taskId === record.task.id)
        if (found !== undefined) {
            found.time += record.endTime - record.startTime
        } else {
            stats.push({
                taskId: record.task.id,
                taskName: record.task.name,
                time: record.endTime - record.startTime
            })
        }
    })
    return stats
}

function formatTime(timeMs: number): string {
    const hours = Math.floor(timeMs / 1000 / 60 / 60)
    const minutes = Math.floor(timeMs / 1000 / 60) % 60
    const seconds = Math.floor(timeMs / 1000) % 60
    return `${hours}h ${minutes}m ${seconds}s`
}
