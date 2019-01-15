export interface Task {
    id: string
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
    exists(taskName: string): Promise<boolean>
}

export interface ActiveTaskRepository {
    getActiveTask(): Promise<ActiveTask | null>
    setActiveTask(task: Task): Promise<ActiveTask>
    clearActiveTask(): Promise<void>
}