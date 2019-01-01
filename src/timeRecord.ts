export interface TimeRecord {
    taskName: string
    startTime: number
    endTime: number
}

export interface TimeRecordRepository {
    addTimeRecord(timeRecord: TimeRecord): Promise<void>
    selectAll(): Promise<TimeRecord[]>
}

export class InMemoryTimeRecordRepository implements TimeRecordRepository {

    private timeRecords: TimeRecord[] = []

    addTimeRecord(timeRecord: TimeRecord): Promise<void> {
        this.timeRecords.push(timeRecord)
        console.log(`Saved time record: ${JSON.stringify(timeRecord)}`)
        return Promise.resolve()
    }

    selectAll(): Promise<TimeRecord[]> {
        console.log(`All time records: ${JSON.stringify(this.timeRecords)}`)
        return Promise.resolve(this.timeRecords)
    }
}