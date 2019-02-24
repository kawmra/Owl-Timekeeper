import { ActiveTaskRepository, ActiveTask } from "../../domain/task";
import * as path from "path";
import fs = require('fs-extra');
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

    async getActiveTask(): Promise<ActiveTask | null> {
        const data = await fs.readFile(this.filePath).catch(() => null)
        if (data === null) { return null }
        const json: any = JSON.parse(data.toString())
        if (json.task === undefined || json.startTime === undefined) {
            console.log('activeTask file was found but has no `task` and/or `startTime`')
            return null
        }
        return { task: json.task, startTime: json.startTime }
    }

    observeActiveTask(): Observable<ActiveTask | null> {
        return new ActiveTaskObservable(this.emitter, this.getActiveTask())
    }

    async setActiveTask(activeTask: ActiveTask): Promise<void> {
        await fs.writeFile(this.filePath, JSON.stringify(activeTask)).catch(e => { throw e })
        this.emitActiveTaskChanged(activeTask)
        return
    }

    async clearActiveTask(): Promise<void> {
        await fs.writeFile(this.filePath, '{}').catch(e => { throw e })
        this.emitActiveTaskChanged(null)
        return
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