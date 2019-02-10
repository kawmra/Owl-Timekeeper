import { ActiveTaskRepository, ActiveTask, Task } from "../../domain/task";
import * as path from "path";
import { app } from "electron";
import fs = require('fs');
import { Observable } from "../../Observable";
import { EventEmitter } from "events";

const filePath = path.join(app.getPath('userData'), 'activeTask.json')

const EVENT_ON_ACTIVE_TASK_CHANGED = 'onActiveTaskChanged'

export class FileActiveTaskRepository implements ActiveTaskRepository {

    private emitter = new EventEmitter()

    getActiveTask(): Promise<ActiveTask | null> {
        return new Promise(resolve => {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    // if failed, pass null instead
                    resolve(null)
                    return
                }
                const json: any = JSON.parse(data.toString())
                if (json.task === undefined || json.startTime === undefined) {
                    console.log('activeTask file was found but has no `task` and/or `startTime`')
                    resolve(null)
                }
                resolve({ task: json.task, startTime: json.startTime })
            })
        })
    }

    observeActiveTask(): Observable<ActiveTask | null> {
        return new ActiveTaskObservable(this.emitter, this.getActiveTask())
    }

    setActiveTask(activeTask: ActiveTask): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, JSON.stringify(activeTask), err => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
                this.emitActiveTaskChanged(activeTask)
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
                this.emitActiveTaskChanged(null)
            })
        })
    }

    private emitActiveTaskChanged(activeTask: ActiveTask | null) {
        this.emitter.emit(EVENT_ON_ACTIVE_TASK_CHANGED, activeTask)
    }
}

class ActiveTaskObservable extends Observable<ActiveTask | null> {

    protected subscribe(listener: (payload: ActiveTask) => void): void {
        this.source.on(EVENT_ON_ACTIVE_TASK_CHANGED, listener)
    }

    protected unsubscribe(listener: (payload: ActiveTask) => void): void {
        this.source.off(EVENT_ON_ACTIVE_TASK_CHANGED, listener)
    }
}