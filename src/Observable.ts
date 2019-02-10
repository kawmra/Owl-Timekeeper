import { EventEmitter } from "events";

type Listener<T> = (payload: T) => void

export abstract class Observable<T> {

    private source: EventEmitter

    private cache: T | null = null

    private rawListeners: Set<Listener<T>> = new Set()

    constructor(source: EventEmitter, defaultValue: Promise<T> = undefined) {
        this.source = source
        if (defaultValue !== undefined) {
            defaultValue.then(value => {
                this.cache = value
                this.rawListeners.forEach(listener => {
                    listener(value)
                })
            })
        }
    }

    public on(listener: Listener<T>) {
        this.subscribe(this.source, (payload: T) => {
            this.cache = payload
            listener(payload)
        })
        if (this.cache !== null) {
            listener(this.cache)
        }
        this.rawListeners.add(listener)
    }

    public off(listener: Listener<T>) {
        this.rawListeners.delete(listener)
        this.unsubscribe(this.source, listener)
    }

    protected abstract subscribe(source: EventEmitter, listener: Listener<T>): void

    protected abstract unsubscribe(source: EventEmitter, listener: Listener<T>): void
}

export class Subscription {

    private observable: Observable<any>

    private observer: Listener<any>

    constructor(observable: Observable<any>, observer: Listener<any>) {
        this.observable = observable
        this.observer = observer
    }

    unsubscribe() {
        this.observable.off(this.observer)
    }
}