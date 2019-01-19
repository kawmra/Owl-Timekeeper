import moment = require("moment");

export class Day {

    private time: moment.Moment

    /**
     * @param year year
     * @param month 0 is January
     * @param day day of month
     * @param utcOffset UTC offset (minutes), default is local time
     */
    constructor(
        year: number,
        month: number,
        day: number,
        utcOffset: number = moment().utcOffset()
    ) {
        this.time = moment().utcOffset(utcOffset).set({ year, month, date: day, hour: 0, minute: 0, second: 0, millisecond: 0 })
    }

    static today(): Day {
        const now = moment()
        return new Day(now.year(), now.month(), now.date(), now.utcOffset())
    }

    toString(format: string = 'YYYY-MM-DD', utcOffset: number = this.time.utcOffset()): string {
        return this.time.clone().utcOffset(utcOffset).format(format)
    }

    toMillis(): number {
        return this.time.valueOf()
    }

    toObject(): { year: number, month: number, day: number, utcOffset: number } {
        return {
            year: this.time.year(),
            month: this.time.month(),
            day: this.time.date(),
            utcOffset: this.time.utcOffset()
        }
    }

    /**
     * Return cloned Day instance that added/subtracted days.
     * 
     * @param daysToAdd days to add (if positive number specified) or to subtract (if negative number specified)
     */
    addDay(daysToAdd: number): Day {
        const m = this.time.clone().add(daysToAdd, 'days')
        return new Day(m.year(), m.month(), m.date(), m.utcOffset())
    }
}
