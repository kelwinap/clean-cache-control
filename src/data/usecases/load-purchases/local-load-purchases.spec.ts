import { LocalLoadPurchases } from '@/data/usecases'
import { CacheStoreSpy, mockPurchases } from '@/data/tests'

type SutTypes = {
    sut: LocalLoadPurchases
    cacheStore: CacheStoreSpy
}

const makeSut = (timestamp = new Date()): SutTypes => {
    const cacheStore = new CacheStoreSpy()
    const sut = new LocalLoadPurchases(cacheStore, timestamp)
    return {
        sut,
        cacheStore
    }
}

describe('LocalLoadPurchases', () => {
    test('should not delete or insert cache on sut.init', () => {
        const { cacheStore } = makeSut()
        expect(cacheStore.actions).toEqual([])
    });

    test('should return empty list if load fails', async () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateFetchError()
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Actions.fetch, CacheStoreSpy.Actions.delete])
        expect(cacheStore.deleteKey).toBe('purchases')
        expect(purchases).toEqual([])
    });

    test('should return a list of purchases if cache is less than 3 days old', async () => {
        const currentDate = new Date()
        const timestamp = new Date(currentDate)
        timestamp.setDate(timestamp.getDate() - 3)
        timestamp.setSeconds(timestamp.getSeconds() + 1)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Actions.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual(cacheStore.fetchResult.value)
    });

    test('should return an empty list of purchases if cache is more than 3 days old', async () => {
        const currentDate = new Date()
        const timestamp = new Date(currentDate)
        timestamp.setDate(timestamp.getDate() - 3)
        timestamp.setSeconds(timestamp.getSeconds() - 1)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Actions.fetch, CacheStoreSpy.Actions.delete])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.deleteKey).toBe('purchases')
        expect(purchases).toEqual([])
    });
});