import { TaskRepository, Task } from "../../domain/task";
import Nedb = require("nedb");
import * as path from "path"
import { app } from "electron";

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

    remove(taskId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.remove({ id: taskId }, {}, (err, num) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
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