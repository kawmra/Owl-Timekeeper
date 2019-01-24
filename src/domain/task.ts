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
    remove(taskId: string): Promise<void>
    /**
     * Update a task with same id as specified task.
     * @param task new task
     */
    update(task: Task): Promise<void>
    selectAll(): Promise<Task[]>
    exists(taskName: string): Promise<boolean>
}

export interface ActiveTaskRepository {
    getActiveTask(): Promise<ActiveTask | null>
    setActiveTask(task: Task): Promise<ActiveTask>
    clearActiveTask(): Promise<void>
}