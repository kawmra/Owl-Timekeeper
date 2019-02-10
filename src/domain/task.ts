import { Observable } from "../Observable";

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
    observeAll(): Observable<Task[]>
    exists(taskId: string): Promise<boolean>
}

export interface ActiveTaskRepository {
    getActiveTask(): Promise<ActiveTask | null>
    observeActiveTask(): Observable<ActiveTask | null>
    setActiveTask(activeTask: ActiveTask): Promise<void>
    clearActiveTask(): Promise<void>
}

export function compareTask(a: Task, b: Task): number {
    if (a.name > b.name) return 1
    else if (a.name < b.name) return -1
    else return 0
}