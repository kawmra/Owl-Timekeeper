import { ActiveTaskRepository, ActiveTask, Task } from "../../domain/task";
import * as path from "path";
import fs = require('fs');
import { Observable } from "../../Observable";
import { EventEmitter } from "events";

const FILE_NAME = 'activeTask.json'
const EVENT_ON_ACTIVE_TASK_CHANGED = 'onActiveTaskChanged'

export class FileActiveTaskRepository implements ActiveTaskRepository {

    private filePath: string
    private emitter = new EventEmitter()

    constructor(dirPath: string) {
        this.filePath = path.join(dirPath, FILE_NAME)
    }

    getActiveTask(): Promise<ActiveTask | null> {
        return new Promise(resolve => {
            fs.readFile(this.filePath, (err, data) => {
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
            fs.writeFile(this.filePath, JSON.stringify(activeTask), err => {
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
            fs.writeFile(this.filePath, '{}', err => {
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

    protected subscribe(source: EventEmitter, listener: (payload: ActiveTask) => void): void {
        source.on(EVENT_ON_ACTIVE_TASK_CHANGED, listener)
    }

    protected unsubscribe(source: EventEmitter, listener: (payload: ActiveTask) => void): void {
        source.off(EVENT_ON_ACTIVE_TASK_CHANGED, listener)
    }
}