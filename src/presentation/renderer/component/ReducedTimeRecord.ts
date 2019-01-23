import { TimeRecord } from "../../../domain/timeRecord";
import { Task } from "../../../domain/task";

export interface ReducedTimeRecord {
    task: Task
    totalTimeMillis: number
    timeRecords: TimeRecord[]
}