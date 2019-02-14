import { EventEmitter } from "events";

type Listener<T> = (payload: T) => void

export abstract class Observable<T> {

    private source: EventEmitter

    private cache: T | null = null

    // raw to wrapper
    private wrapperMap: Map<Listener<T>, Listener<T>> = new Map()

    constructor(source: EventEmitter, defaultValue: Promise<T> = undefined) {
        this.source = source
        if (defaultValue !== undefined) {
            defaultValue.then(value => {
                this.cache = value
                this.wrapperMap.forEach((_, listener) => {
                    listener(value)
                })
            })
        }
    }

    public on(listener: Listener<T>) {
        if (this.wrapperMap.has(listener)) {
            // Already specified listener listens this Observable
            return
        }
        const wrapper = (payload: T) => {
            this.cache = payload
            listener(payload)
        }
        this.wrapperMap.set(listener, wrapper)
        this.subscribe(this.source, wrapper)
        if (this.cache !== null) {
            listener(this.cache)
        }
    }

    public off(listener: Listener<T>) {
        const wrapper = this.wrapperMap.get(listener)
        this.wrapperMap.delete(listener)
        if (wrapper) {
            this.unsubscribe(this.source, wrapper)
        }
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