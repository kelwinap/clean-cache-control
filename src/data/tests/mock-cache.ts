import { CacheStore } from '@/data/usecases/protocols/cache'
import { SavePurchases } from '@/domain/usecases'

export class CacheStoreSpy implements CacheStore {
    actions: Array<CacheStoreSpy.Actions> = []
    deleteKey: string
    insertKey: string
    insertValues: Array<SavePurchases.Params> = []
    fetchKey: string

    fetch(key: string): void {
        this.actions.push(CacheStoreSpy.Actions.fetch)
        this.fetchKey = key
    }

    delete(key: string): void {
        this.actions.push(CacheStoreSpy.Actions.delete)
        this.deleteKey = key
    }

    insert(key: string, value: any): void {
        this.actions.push(CacheStoreSpy.Actions.insert)
        this.insertKey = key
        this.insertValues = value
    }

    replace(key: string, value: any): void {
        this.delete(key)
        this.insert(key, value)
    }

    simulateDeleteError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'delete').mockImplementationOnce(() => {
            this.actions.push(CacheStoreSpy.Actions.delete)
            throw new Error()
        })
    }

    simulateInsertError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'insert').mockImplementationOnce(() => {
            this.actions.push(CacheStoreSpy.Actions.insert)
            throw new Error()
        })
    }

    simulateFetchError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'fetch').mockImplementationOnce(() => {
            this.actions.push(CacheStoreSpy.Actions.fetch)
            throw new Error()
        })
    }
}

export namespace CacheStoreSpy {
    export enum Actions {
        delete,
        insert,
        fetch
    }
}