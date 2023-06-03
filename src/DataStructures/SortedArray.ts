export class SortedItem<K, T> {
    key: K
    value: T
    constructor(key: K, value: T) {
        this.key = key;
        this.value = value;
    }
}


export class SortedArray<K, T> {
    items: Array<SortedItem<K, T>> = [];

    insert(key: K, item: T) {
        // find the right spot to insert
    }

    get(key: K) {
        // 
    }

    clear() {
        this.items = [];
    }

    get values () {
        return this.items.map((item) => {
            return item.value;
        })
    }
}