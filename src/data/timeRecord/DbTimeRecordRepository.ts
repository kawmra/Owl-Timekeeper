import { TimeRecordRepository, TimeRecord } from "../../domain/timeRecord";
import { Day } from "../../domain/day";
import Nedb = require("nedb");
import * as path from "path"
import { app } from "electron";
import { Observable } from "../../Observable";
import { EventEmitter } from 'events';

const FILE_NAME = 'timeRecords.db'
// Parameters: day: Day, records_of_the_day: TimeRecord[]
const EVENT_ON_TIME_RECORD_CHANGED = 'onTimeRecordChanged'

export class DbTimeRecordRepository implements TimeRecordRepository {

    private db: Nedb
    private emitter = new EventEmitter()

    constructor(dirPath: string) {
        this.db = new Nedb({
            filename: path.join(dirPath, FILE_NAME),
            autoload: true
        })
    }

    addTimeRecord(timeRecord: TimeRecord): Promise<void> {
        this.db.insert(timeRecord)
        return new Promise(resolve => {
            resolve()
            this.emitTimeRecordChanged(Day.fromMillis(timeRecord.startTime))
        })
    }

    update(timeRecord: TimeRecord): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.update({ id: timeRecord.id }, timeRecord, {}, err => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
                this.emitTimeRecordChanged(Day.fromMillis(timeRecord.startTime))
            })
        })
    }

    updateTaskName(taskId: string, newName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.update({ "task.id": taskId }, { $set: { "task.name": newName } }, { multi: true }, err => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
                this.emitTimeRecordChangedByUpdateTaskName(taskId)
            })
        })
    }

    select(day: Day): Promise<TimeRecord[]> {
        return new Promise((resolve, reject) => {
            const dayStart = day.toMillis()
            const dayEnd = dayStart + 86400000 // 24 hours later
            this.db.find({ $and: [{ startTime: { $gte: dayStart } }, { startTime: { $lt: dayEnd } }] }).exec((err, docs: TimeRecord[]) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(docs)
            })
        })
    }

    observe(day: Day): Observable<TimeRecord[]> {
        return new TimeRecordObservable(day, this.emitter, this.select(day))
    }

    selectAll(): Promise<TimeRecord[]> {
        return new Promise((resolve, reject) => {
            this.db.find({}).exec((err, docs: TimeRecord[]) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(docs)
            })
        })
    }

    delete(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Find record first because need it to call emitTimeRecordChanged later
            this.db.findOne({ id }, (err, record: TimeRecord) => {
                if (err) {
                    reject(err)
                    return
                }
                this.db.remove({ id }, err => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve()
                    this.emitTimeRecordChanged(Day.fromMillis(record.startTime))
                })
            })
        })
    }

    private emitTimeRecordChanged(day: Day) {
        this.select(day).then(records => {
            console.log(`emitTimeRecordChanged; day: ${day}`)
            this.emitter.emit(EVENT_ON_TIME_RECORD_CHANGED, day, records)
        })
    }

    private emitTimeRecordChangedByUpdateTaskName(taskId: string) {
        this.db.find({ "task.id": taskId }, { startTime: 1 }).exec((err, docs) => {
            if (err) {
                return
            }
            docs.map(doc => {
                // Use unixtime instead of Day because Day class cannnot be compared by Array.indexOf
                return Day.fromMillis(doc.startTime).toMillis()
            }).filter((dayMillis, i, arr) => {
                // distinct filter
                return arr.indexOf(dayMillis) === i
            }).forEach(dayMillis => {
                const day = Day.fromMillis(dayMillis)
                this.emitTimeRecordChanged(day)
            })
        })
    }
}

type RawListener = (payload: TimeRecord[]) => void

type WrapperListener = (day: Day, records: TimeRecord[]) => void

class TimeRecordObservable extends Observable<TimeRecord[]> {

    private day: Day

    private listeners: Map<RawListener, WrapperListener> = new Map()

    constructor(day: Day, source: EventEmitter, defaultValue: Promise<TimeRecord[]>) {
        super(source, defaultValue)
        this.day = day
    }

    protected subscribe(source: EventEmitter, listener: RawListener): void {
        const wrapperListener: WrapperListener = (day, records) => {
            if (day.equals(this.day)) {
                listener(records)
            }
        }
        this.listeners.set(listener, wrapperListener)
        source.on(EVENT_ON_TIME_RECORD_CHANGED, wrapperListener)
    }

    protected unsubscribe(source: EventEmitter, listener: RawListener): void {
        const wrapperListener = this.listeners.get(listener)
        if (!wrapperListener) {
            return
        }
        source.off(EVENT_ON_TIME_RECORD_CHANGED, wrapperListener)
    }
}
