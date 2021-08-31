import { LocalSavePurchases } from '@/data/usecases'
import { CacheStore } from '@/data/usecases/protocols/cache'
import { SavePurchases } from '@/domain'


class CacheStoreSpy implements CacheStore {

    deleteCallsCount = 0
    insertCallsCount = 0
    deleteKey: string
    insertKey: string
    insertValues: Array<SavePurchases.Params> = []

    delete(key: string): void {
        this.deleteCallsCount++
        this.deleteKey = key
    }

    insert(key: string, value: any): void {
        this.insertCallsCount++
        this.insertKey = key
        this.insertValues = value
    }
}

const mockPurchases = (): Array<SavePurchases.Params> => [{
    id: '1',
    date: new Date(),
    value: 50
}, {
    id: '2',
    date: new Date(),
    value: 70
}]

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
        await sut.save(mockPurchases())
        expect(cacheStore.deleteCallsCount).toBe(1)
        expect(cacheStore.deleteKey).toBe('purchases')
    });

    test('should not insert new cache if delete fails', async () => {
        const { cacheStore, sut } = makeSut()
        jest.spyOn(cacheStore, 'delete').mockImplementationOnce(() => { throw new Error() })
        const promise = sut.save(mockPurchases())
        expect(cacheStore.insertCallsCount).toBe(0)
        expect(promise).rejects.toThrow()
    });

    test('should insert new cache if delete succeeds', async () => {
        const { cacheStore, sut } = makeSut()
        await sut.save(mockPurchases())
        expect(cacheStore.deleteCallsCount).toBe(1)
        expect(cacheStore.insertCallsCount).toBe(1)
        expect(cacheStore.insertKey).toBe('purchases')
    });


    test('should insert new cache if delete succeeds', async () => {
        const { cacheStore, sut } = makeSut()
        const purchases = mockPurchases()
        await sut.save(purchases)
        expect(cacheStore.deleteCallsCount).toBe(1)
        expect(cacheStore.insertCallsCount).toBe(1)
        expect(cacheStore.insertKey).toBe('purchases')
        expect(cacheStore.insertValues).toEqual(purchases)
    });
});