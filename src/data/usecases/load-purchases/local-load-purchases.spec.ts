import { LocalLoadPurchases } from '@/data/usecases'
import { CacheStoreSpy } from '@/data/tests'

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

    test('should call correct key on load', async () => {
        const { cacheStore, sut } = makeSut()
        await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Actions.fetch])
        expect(cacheStore.fetchKey).toEqual('purchases')
    });
});