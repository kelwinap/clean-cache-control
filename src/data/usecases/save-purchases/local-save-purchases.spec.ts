import { LocalSavePurchases } from '@/data/usecases'
import { CacheStore } from '@/data/usecases/protocols/cache'


class CacheStoreSpy implements CacheStore {
    deleteCallsCount = 0
    insertCallsCount = 0
    key: string

    delete(key: string): void {
        this.deleteCallsCount++
        this.key = key
    }
}

type SutTypes = {
    sut: LocalSavePurchases
    cacheStore: CacheStoreSpy
}

const makeSut = (): SutTypes => {
    const cacheStore = new CacheStoreSpy()
    const sut = new LocalSavePurchases(cacheStore)
    return {
        sut,
        cacheStore
    }
}

describe('LocalSavePurchases', () => {
    test('should not delete cache on sut.init', () => {
        const { cacheStore } = makeSut()
        expect(cacheStore.deleteCallsCount).toBe(0)
    });

    test('should delete old cache on sut.save', async () => {
        const { cacheStore, sut } = makeSut()
        await sut.save()
        expect(cacheStore.deleteCallsCount).toBe(1)
        expect(cacheStore.key).toBe('purchases')
    });

    test('should not insert new cache if delete fails', async () => {
        const { cacheStore, sut } = makeSut()
        jest.spyOn(cacheStore, 'delete').mockImplementationOnce(() => { throw new Error() })
        const promise = sut.save()
        expect(cacheStore.insertCallsCount).toBe(0)
        expect(promise).rejects.toThrow()
    });
});