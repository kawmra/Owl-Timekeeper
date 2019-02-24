import { AppSettingsImpl } from './../data/settings/FileSettingsRepository';
import { Task, ActiveTask, TaskRepository, ActiveTaskRepository } from "./task";
import { TimeRecord, TimeRecordRepository } from "./timeRecord";
import { Day } from "./day";
import { v4 } from "uuid";
import { DbTaskRepository } from "../data/task/DbTaskRepository";
import { DbTimeRecordRepository } from "../data/timeRecord/DbTimeRecordRepository";
import { FileActiveTaskRepository } from "../data/task/FileActiveTaskRepository";
import { Subscription } from "../Observable";
import { StoragePath, AppSettings } from "./settings";

// TODO: Those instances should be injected.
const settings: AppSettings = new AppSettingsImpl()
const storagePath = settings.getStoragePathSync()
let taskRepository: TaskRepository = new DbTaskRepository(storagePath.absolutePath)
let activeTaskRepository: ActiveTaskRepository = new FileActiveTaskRepository(storagePath.absolutePath)
let timeRecordRepository: TimeRecordRepository = new DbTimeRecordRepository(storagePath.absolutePath)

export async function createTask(name: string): Promise<Task> {
    const task = { id: v4(), name }
    await taskRepository.add(task)
    return task
}

export async function deleteTask(taskId: string): Promise<void> {
    await taskRepository.remove(taskId)
    console.log(`task deleted (id: ${taskId})`)
}

export async function updateTaskName(taskId: string, newName: string): Promise<void> {
    async function updateActiveTaskName() {
        const currentActiveTask = await activeTaskRepository.getActiveTask()
        if (!currentActiveTask || currentActiveTask.task.id !== taskId) {
            return
        }
        await activeTaskRepository.setActiveTask({
            ...currentActiveTask,
            task: {
                ...currentActiveTask.task,
                name: newName
            }
        })
    }
    await Promise.all([
        taskRepository.update({ id: taskId, name: newName }),
        timeRecordRepository.updateTaskName(taskId, newName),
        updateActiveTaskName(),
    ])
}

export async function getTasks(): Promise<Task[]> {
    return taskRepository.selectAll()
}

export function observeTasks(listener: (tasks: Task[]) => void): Subscription {
    const observable = taskRepository.observeAll()
    observable.on(listener)
    return new Subscription(observable, listener)
}

export async function existsTask(taskName: string): Promise<boolean> {
    return taskRepository.exists(taskName)
}

export async function setActiveTask(task: Task): Promise<ActiveTask> {
    const activeTask = { task, startTime: new Date().getTime() }
    await activeTaskRepository.setActiveTask(activeTask)
    return activeTask
}

export async function getActiveTask(): Promise<ActiveTask | null> {
    return await activeTaskRepository.getActiveTask()
}

export function observeActiveTask(listener: (activeTask: ActiveTask | null) => void): Subscription {
    const observable = activeTaskRepository.observeActiveTask()
    observable.on(listener)
    return new Subscription(observable, listener)
}

export async function clearActiveTask(): Promise<void> {
    return activeTaskRepository.clearActiveTask()
}

export async function addTimeRecord(task: Task, startTime: number, endTime: number): Promise<TimeRecord> {
    const timeRecord = { id: v4(), task, startTime, endTime }
    await timeRecordRepository.addTimeRecord(timeRecord)
    return timeRecord
}

export async function getTimeRecords(day: Day): Promise<TimeRecord[]> {
    return timeRecordRepository.select(day)
}

export function observeTimeRecords(day: Day, listener: (records: TimeRecord[]) => void): Subscription {
    const observable = timeRecordRepository.observe(day)
    observable.on(listener)
    return new Subscription(observable, listener)
}

/**
 * Update a single time record that has same id as specified timeRecord.
 * 
 * @param timeRecord new TimeRecord
 */
export async function updateTimeRecord(timeRecord: TimeRecord): Promise<void> {
    return timeRecordRepository.update(timeRecord)
}

export async function deleteTimeRecord(id: string): Promise<void> {
    return timeRecordRepository.delete(id)
}

// currentry `needMigration` is not supported, it will be ignored
export async function setStoragePath(absolutePath: string, needMigration: boolean): Promise<void> {
    return settings.setStoragePath(absolutePath, needMigration)
}

export async function getStoragePath(): Promise<StoragePath> {
    return settings.getStoragePathSync()
}
