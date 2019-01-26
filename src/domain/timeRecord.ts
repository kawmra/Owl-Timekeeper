import { Day } from "./day";
import { Task } from "./task";

export interface TimeRecord {
    task: Task
    startTime: number
    endTime: number
}

export interface TimeRecordRepository {
    addTimeRecord(timeRecord: TimeRecord): Promise<void>
    updateTaskName(taskId: string, newName: string): Promise<void>
    select(day: Day): Promise<TimeRecord[]>
    selectAll(): Promise<TimeRecord[]>
}