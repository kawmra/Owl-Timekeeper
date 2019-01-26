import { Task, ActiveTask } from "./task";
import { TimeRecord } from "./timeRecord";
import { Day } from "./day";
import { v4 } from "uuid";
import { DbTaskRepository } from "../data/task/DbTaskRepository";
import { DbTimeRecordRepository } from "../data/timeRecord/DbTimeRecordRepository";
import { FileActiveTaskRepository } from "../data/task/FileActiveTaskRepository";

const taskRepository = new DbTaskRepository()
const activeTaskRepository = new FileActiveTaskRepository()
const timeRecordRepository = new DbTimeRecordRepository()

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
        if (currentActiveTask.task.id !== taskId) {
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

export async function clearActiveTask(): Promise<void> {
    return activeTaskRepository.clearActiveTask()
}

export async function addTimeRecord(task: Task, startTime: number, endTime: number): Promise<TimeRecord> {
    const timeRecord = { task, startTime, endTime }
    await timeRecordRepository.addTimeRecord(timeRecord)
    return timeRecord
}

export async function getTimeRecords(day: Day): Promise<TimeRecord[]> {
    return timeRecordRepository.select(day)
}