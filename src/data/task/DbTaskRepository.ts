import { TaskRepository, Task } from "../../domain/task";
import Nedb = require("nedb");
import * as path from "path"
import { app } from "electron";
import { EventEmitter } from "events";
import { Observable } from "../../Observable";

export const ERROR_TASK_ALREADY_EXISTS = 'task already exists'

const EVENT_ON_TASK_CHANGED = 'onTaskChanged'

export class DbTaskRepository implements TaskRepository {

    private db = new Nedb({
        filename: path.join(app.getPath('userData'), 'tasks.db'),
        autoload: true
    })

    private emitter = new EventEmitter()

    private emitTimer: NodeJS.Timeout

    add(task: Task): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.count({ id: task.id }, (err, n) => {
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
                    this.emitTasksChanged()
                })
            })
        })
    }

    remove(taskId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.remove({ id: taskId }, {}, (err, num) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
                this.emitTasksChanged()
            })
        })
    }

    update(task: Task): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.update({ id: task.id }, task, {}, err => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
                this.emitTasksChanged()
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

    observeAll(): Observable<Task[]> {
        return new TaskObservable(this.emitter, this.selectAll())
    }

    exists(taskId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.count({ id: taskId }, (err, n) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(n > 0)
            })
        })
    }

    private emitTasksChanged() {
        clearTimeout(this.emitTimer)
        this.emitTimer = setTimeout(() => {
            this.selectAll().then(tasks => {
                this.emitter.emit(EVENT_ON_TASK_CHANGED, tasks)
            })
        }, 100)
    }
}

class TaskObservable extends Observable<Task[]> {

    protected subscribe(listener: (payload: Task[]) => void): void {
        this.source.on(EVENT_ON_TASK_CHANGED, listener)
    }

    protected unsubscribe(listener: (payload: Task[]) => void): void {
        this.source.off(EVENT_ON_TASK_CHANGED, listener)
    }
}