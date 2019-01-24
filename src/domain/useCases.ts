import { Task, ActiveTask } from "./task";
import { TimeRecord } from "./timeRecord";
import { Day } from "./day";
import { v4 } from "uuid";
import { DbTaskRepository } from "../data/task/DbTaskRepository";
import { DbActiveTaskRepository } from "../data/task/DbActiveTaskRepository";
import { DbTimeRecordRepository } from "../data/timeRecord/DbTimeRecordRepository";

const taskRepository = new DbTaskRepository()
const activeTaskRepository = new DbActiveTaskRepository()
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
    await Promise.all([
        taskRepository.update({ id: taskId, name: newName }),
        timeRecordRepository.updateTaskName(taskId, newName),
    ])
}

export async function getTasks(): Promise<Task[]> {
    return taskRepository.selectAll()
}

export async function existsTask(taskName: string): Promise<boolean> {
    return taskRepository.exists(taskName)
}

export async function setActiveTask(task: Task): Promise<ActiveTask> {
    return activeTaskRepository.setActiveTask(task)
}

export async function getActiveTask(): Promise<ActiveTask | null> {
    const activeTask = await activeTaskRepository.getActiveTask()
    if (activeTask != null && await existsTask(activeTask.task.name)) {
        return activeTask
    }
    // return null if task of activeTask didn't exist
    return null
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