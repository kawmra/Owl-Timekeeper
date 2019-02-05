import { Day } from "./day";
import { Task } from "./task";

export interface TimeRecord {
    id: string
    task: Task
    startTime: number
    endTime: number
}

export interface TimeRecordRepository {
    addTimeRecord(timeRecord: TimeRecord): Promise<void>
    update(timeRecord: TimeRecord): Promise<void>
    updateTaskName(taskId: string, newName: string): Promise<void>
    select(day: Day): Promise<TimeRecord[]>
    selectAll(): Promise<TimeRecord[]>
    delete(id: string): Promise<void>
}

export function compareTimeRecord(a: TimeRecord, b: TimeRecord): number {
    if (a.startTime > b.startTime) return 1
    else if (a.startTime < b.startTime) return -1
    else return 0
}