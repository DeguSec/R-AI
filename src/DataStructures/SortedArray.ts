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
        // get potential item
        const index = this.findIndex(key);

        // goes off the far end of the array
        if(index == this.items.length) {
            this.items.push(new SortedItem<K, T>(key, item));
        }
    }

    get(key: K) {
        // get potential item
        const index = this.findIndex(key);

        // goes off the far end of the array
        if(index == this.items.length)
            return null;
        
        // possibly item in array
        const item = this.items[index];

        if(item.key == key)
            return item.value;

        return null;
    }

    private findIndex(key: K, start?: number, end?: number): number {
        // init vars
        start = start ?? 0;
        end = end ?? this.items.length;

        // return the index
        if(start == end)
            return start;

        // find the midpoint
        const checkIndex = ((start + end) / 2) % 1; 
        console.log(checkIndex);

        // find the key at index 
        const checkItem = this.items[checkIndex].key;

        if(checkItem == key) 
            return checkIndex;

        else if(checkItem > key)
            return this.findIndex(key, checkIndex + 1, end);

        else // checkItem < key
            return this.findIndex(key, start, checkIndex - 1);
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