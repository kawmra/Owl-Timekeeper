import { ActiveTaskRepository, ActiveTask, Task } from "../../domain/task";
import * as path from "path";
import { app } from "electron";
import fs = require('fs');

const filePath = path.join(app.getPath('userData'), 'activeTask.json')

export class FileActiveTaskRepository implements ActiveTaskRepository {

    getActiveTask(): Promise<ActiveTask | null> {
        return new Promise(resolve => {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    // if failed, pass null instead
                    resolve(null)
                    return
                }
                const json: any = JSON.parse(data.toString())
                console.log("getActiveTask(); ", json)
                if (json.task === undefined || json.startTime === undefined) {
                    console.log('activeTask file was found but has no `task` and/or `startTime`')
                    resolve(null)
                }
                resolve({ task: json.task, startTime: json.startTime })
            })
        })
    }

    setActiveTask(activeTask: ActiveTask): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, JSON.stringify(activeTask), err => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
    }

    clearActiveTask(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, '{}', err => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
    }
}