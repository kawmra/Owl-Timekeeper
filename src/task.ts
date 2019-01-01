import { MenuItem } from "electron";
import { setActiveTask } from "./useCases";

export interface Task {
    name: string
}

export interface ActiveTask {
    task: Task
    startTime: number
}

export interface TaskRepository {
    add(task: Task): Promise<void>
    remove(task: Task): Promise<void>
    selectAll(): Promise<Task[]>
}

export interface ActiveTaskRepository {
    getActiveTask(): Promise<ActiveTask | null>
    setActiveTask(task: Task): Promise<ActiveTask>
    clearActiveTask(): Promise<void>
}

export class InMemoryTaskRepository implements TaskRepository {

    private tasks: Map<string, Task> = new Map()

    add(task: Task): Promise<void> {
        this.tasks.set(task.name, task)
        console.log(`Added task: ${JSON.stringify(task)}`)
        return Promise.resolve()
    }

    remove(task: Task): Promise<void> {
        this.tasks.delete(task.name)
        console.log(`Removed task: ${JSON.stringify(task)}`)
        return Promise.resolve()
    }

    selectAll(): Promise<Task[]> {
        return Promise.resolve(Array.from(this.tasks.values()))
    }
}

export class InMemoryActiveTaskRepository implements ActiveTaskRepository {

    private activeTask: ActiveTask | null = null

    getActiveTask(): Promise<ActiveTask | null> {
        return Promise.resolve(this.activeTask)
    }

    setActiveTask(task: Task): Promise<ActiveTask> {
        const activeTask = {
            task,
            startTime: new Date().getTime()
        }
        this.activeTask = activeTask
        console.log(`Saved active task: ${JSON.stringify(activeTask)}`)
        return Promise.resolve(activeTask)
    }

    clearActiveTask(): Promise<void> {
        this.activeTask = null
        return Promise.resolve()
    }
}