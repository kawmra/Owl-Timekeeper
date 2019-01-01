import { Task, InMemoryTaskRepository, ActiveTask, InMemoryActiveTaskRepository } from "./task";
import { InMemoryTimeRecordRepository, TimeRecord } from "./timeRecord";

const taskRepository = new InMemoryTaskRepository()
const activeTaskRepository = new InMemoryActiveTaskRepository()
const timeRecordRepository = new InMemoryTimeRecordRepository()

export async function createTask(name: string): Promise<Task> {
    const task = { name }
    taskRepository.add(task)
    return Promise.resolve(task)
}

export async function deleteTask(task: Task): Promise<void> {
    taskRepository.remove(task)
    return Promise.resolve()
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

export async function clearActiveTask(): Promise<void> {
    return activeTaskRepository.clearActiveTask()
}

export async function addTimeRecord(task: Task, startTime: number, endTime: number): Promise<TimeRecord> {
    const timeRecord = { taskName: task.name, startTime, endTime }
    timeRecordRepository.addTimeRecord(timeRecord)
    return Promise.resolve(timeRecord)
}

export async function getTimeRecords(): Promise<TimeRecord[]> {
    return timeRecordRepository.selectAll()
}