export interface Day {
    year: number
    month: number
    day: number
}

export function dateToDay(date: Date): Day {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
    }
}

export function currentDay(): Day {
    return dateToDay(new Date())
}

export function millisToDay(millis: number): Day {
    const date = new Date(millis)
    return dateToDay(date)
}

export function dayToString(day: Day): string {
    return `${day.year}-${day.month}-${day.day}`
}

export function dayToMillis(day: Day): number {
    return new Date(day.year, day.month - 1, day.day).getTime()
}
