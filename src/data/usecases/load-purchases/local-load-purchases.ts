import { CachePolicy, CacheStore } from '@/data/usecases/protocols/cache'
import { SavePurchases, LoadPurchases } from '@/domain/usecases'

export class LocalLoadPurchases implements SavePurchases, LoadPurchases {
    private readonly key = 'purchases'
    constructor(
        private readonly cacheStore: CacheStore,
        private readonly currentDate: Date
    ) { }

    async save(purchases: Array<SavePurchases.Params>): Promise<void> {

        this.cacheStore.replace(this.key, {
            timestamp: this.currentDate,
            value: purchases
        })
    }

    async loadAll(): Promise<Array<LoadPurchases.Result>> {
        try {
            const cache = this.cacheStore.fetch(this.key)

            if (CachePolicy.validate(cache.timestamp, this.currentDate)) {
                return cache.value
            }
            else {
                throw new Error()
            }

        }
        catch (error) {
            this.cacheStore.delete(this.key)
            return []
        }
    }
}