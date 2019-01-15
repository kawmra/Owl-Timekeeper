import { ActiveTaskRepository, ActiveTask, Task } from "../../domain/task";
import * as path from "path"
import Nedb = require("nedb");
import { app } from "electron";

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