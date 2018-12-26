import { Task, InMemoryTaskRepository, ActiveTask, InMemoryActiveTaskRepository } from "./task";
import { InMemoryTimeRecordRepository, TimeRecord } from "./timeRecord";

const taskRepository = new InMemoryTaskRepository()
const activeTaskRepository = new InMemoryActiveTaskRepository()
const timeRecordRepository = new InMemoryTimeRecordRepository()

export async function createTask(name: string): Promise<Task> {
    return new Promise<Task>(resolve => {
        const task = { name }
        taskRepository.add(task)
        resolve(task)
    })
}

export async function deleteTask(task: Task): Promise<any> {
    return new Promise(resolve => {
        taskRepository.remove(task)
        resolve()
    })
}

export async function getTasks(): Promise<Task[]> {
    return taskRepository.selectAll()
}

export async function setActiveTask(task: Task): Promise<ActiveTask> {
    return activeTaskRepository.setActiveTask(task)
}

export async function getActiveTask(): Promise<ActiveTask | null> {
    return activeTaskRepository.getActiveTask()
}

export async function clearActiveTask(): Promise<any> {
    return activeTaskRepository.clearActiveTask()
}

export async function addTimeRecord(task: Task, startTime: number, endTime: number): Promise<TimeRecord> {
    return new Promise<TimeRecord>(resolve => {
        const timeRecord = { taskName: task.name, startTime, endTime }
        timeRecordRepository.addTimeRecord(timeRecord)
        resolve(timeRecord)
    })
}

export async function getTimeRecords(): Promise<TimeRecord[]> {
    return timeRecordRepository.selectAll()
}