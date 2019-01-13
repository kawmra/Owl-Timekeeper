import { app } from "electron";
import Nedb = require("nedb");
import * as path from "path"

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
    exists(taskName: string): Promise<boolean>
}

export interface ActiveTaskRepository {
    getActiveTask(): Promise<ActiveTask | null>
    setActiveTask(task: Task): Promise<ActiveTask>
    clearActiveTask(): Promise<void>
}

export const ERROR_TASK_ALREADY_EXISTS = 'task already exists'

export class DbTaskRepository implements TaskRepository {

    private db = new Nedb({
        filename: path.join(app.getPath('userData'), 'tasks.db'),
        autoload: true
    })

    add(task: Task): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.count({ name: task.name }, (err, n) => {
                if (err) {
                    reject(err)
                    return
                }
                if (n > 0) {
                    reject(ERROR_TASK_ALREADY_EXISTS)
                    return
                }
                this.db.insert(task, (err) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve()
                })
            })
        })
    }

    remove(task: Task): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.remove({ name: task.name }, {}, (err, num) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
    }

    selectAll(): Promise<Task[]> {
        return new Promise((resolve, reject) => {
            this.db.find({}).exec((err, docs: Task[]) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(docs)
            })
        })
    }

    exists(taskName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.count({ name: taskName }, (err, n) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(n > 0)
            })
        })
    }
}

export class DbActiveTaskRepository implements ActiveTaskRepository {

    private activeTaskId = 'activeTask'

    private db = new Nedb({
        filename: path.join(app.getPath('userData'), 'activeTask.db'),
        autoload: true
    })

    getActiveTask(): Promise<ActiveTask | null> {
        return new Promise((resolve, reject) => {
            this.db.findOne({ _id: this.activeTaskId }, (err, doc: ActiveTask | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(doc)
            })
        })
    }

    setActiveTask(task: Task): Promise<ActiveTask> {
        return new Promise((resolve, reject) => {
            const activeTask = {
                task,
                startTime: new Date().getTime()
            }
            this.db.update({ _id: this.activeTaskId }, { _id: this.activeTaskId, ...activeTask }, { upsert: true }, (err) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(activeTask)
            })
        })
    }

    clearActiveTask(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.remove({ _id: this.activeTaskId }, (err) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
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