/* @internal */
namespace ts {
    export function getIterator<I extends readonly any[] | ReadonlySet<any> | ReadonlyESMap<any, any> | undefined>(iterable: I): Iterator<
        I extends ReadonlyESMap<infer K, infer V> ? [K, V] :
        I extends ReadonlySet<infer T> ? T :
        I extends readonly (infer T)[] ? T :
        I extends undefined ? undefined :
        never>;
    export function getIterator<K, V>(iterable: ReadonlyESMap<K, V>): Iterator<[K, V]>;
    export function getIterator<K, V>(iterable: ReadonlyESMap<K, V> | undefined): Iterator<[K, V]> | undefined;
    export function getIterator<T>(iterable: readonly T[] | ReadonlySet<T>): Iterator<T>;
    export function getIterator<T>(iterable: readonly T[] | ReadonlySet<T> | undefined): Iterator<T> | undefined;
    export function getIterator(iterable: readonly any[] | ReadonlySet<any> | ReadonlyESMap<any, any> | undefined): Iterator<any> | undefined {
        if (iterable) {
            if (isArray(iterable)) return arrayIterator(iterable);
            if (iterable instanceof Map) return iterable.entries();
            if (iterable instanceof Set) return iterable.values();
            throw new Error("Iteration not supported.");
        }
    }

    export const emptyArray: never[] = [] as never[];
    export const emptyMap: ReadonlyESMap<never, never> = new Map<never, never>();
    export const emptySet: ReadonlySet<never> = new Set<never>();

    export function length(array: readonly any[] | undefined): number {
        return array ? array.length : 0;
    }

    /**
     * Iterates through 'array' by index and performs the callback on each element of array until the callback
     * returns a truthy value, then returns that value.
     * If no such value is found, the callback is applied to each element of array and undefined is returned.
     */
    export function forEach<T, U>(array: readonly T[] | undefined, callback: (element: T, index: number) => U | undefined): U | undefined {
        if (array) {
            for (let i = 0; i < array.length; i++) {
                const result = callback(array[i], i);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }

    /**
     * Like `forEach`, but iterates in reverse order.
     */
    export function forEachRight<T, U>(array: readonly T[] | undefined, callback: (element: T, index: number) => U | undefined): U | undefined {
        if (array) {
            for (let i = array.length - 1; i >= 0; i--) {
                const result = callback(array[i], i);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }

    /** Like `forEach`, but suitable for use with numbers and strings (which may be falsy). */
    export function firstDefined<T, U>(array: readonly T[] | undefined, callback: (element: T, index: number) => U | undefined): U | undefined {
        if (array === undefined) {
            return undefined;
        }

        for (let i = 0; i < array.length; i++) {
            const result = callback(array[i], i);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    export function firstDefinedIterator<T, U>(iter: Iterator<T>, callback: (element: T) => U | undefined): U | undefined {
        while (true) {
            const iterResult = iter.next();
            if (iterResult.done) {
                return undefined;
            }
            const result = callback(iterResult.value);
            if (result !== undefined) {
                return result;
            }
        }
    }

    export function reduceLeftIterator<T, U>(iterator: Iterator<T> | undefined, f: (memo: U, value: T, i: number) => U, initial: U): U {
        let result = initial;
        if (iterator) {
            for (let step = iterator.next(), pos = 0; !step.done; step = iterator.next(), pos++) {
                result = f(result, step.value, pos);
            }
        }
        return result;
    }

    export function zipWith<T, U, V>(arrayA: readonly T[], arrayB: readonly U[], callback: (a: T, b: U, index: number) => V): V[] {
        const result: V[] = [];
        Debug.assertEqual(arrayA.length, arrayB.length);
        for (let i = 0; i < arrayA.length; i++) {
            result.push(callback(arrayA[i], arrayB[i], i));
        }
        return result;
    }

    export function zipToIterator<T, U>(arrayA: readonly T[], arrayB: readonly U[]): Iterator<[T, U]> {
        Debug.assertEqual(arrayA.length, arrayB.length);
        let i = 0;
        return {
            next() {
                if (i === arrayA.length) {
                    return { value: undefined as never, done: true };
                }
                i++;
                return { value: [arrayA[i - 1], arrayB[i - 1]] as [T, U], done: false };
            }
        };
    }

    export function zipToMap<K, V>(keys: readonly K[], values: readonly V[]): ESMap<K, V> {
        Debug.assert(keys.length === values.length);
        const map = new Map<K, V>();
        for (let i = 0; i < keys.length; ++i) {
            map.set(keys[i], values[i]);
        }
        return map;
    }

    /**
     * Creates a new array with `element` interspersed in between each element of `input`
     * if there is more than 1 value in `input`. Otherwise, returns the existing array.
     */
    export function intersperse<T>(input: T[], element: T): T[] {
        if (input.length <= 1) {
            return input;
        }
        const result: T[] = [];
        for (let i = 0, n = input.length; i < n; i++) {
            if (i) result.push(element);
            result.push(input[i]);
        }
        return result;
    }

    /**
     * Iterates through `array` by index and performs the callback on each element of array until the callback
     * returns a falsey value, then returns false.
     * If no such value is found, the callback is applied to each element of array and `true` is returned.
     */
    export function every<T>(array: readonly T[] | undefined, callback: (element: T, index: number) => boolean): boolean {
        if (array) {
            for (let i = 0; i < array.length; i++) {
                if (!callback(array[i], i)) {
                    return false;
                }
            }
        }

        return true;
    }

    /** Works like Array.prototype.find, returning `undefined` if no element satisfying the predicate is found. */
    export function find<T, U extends T>(array: readonly T[], predicate: (element: T, index: number) => element is U): U | undefined;
    export function find<T>(array: readonly T[], predicate: (element: T, index: number) => boolean): T | undefined;
    export function find<T>(array: readonly T[], predicate: (element: T, index: number) => boolean): T | undefined {
        for (let i = 0; i < array.length; i++) {
            const value = array[i];
            if (predicate(value, i)) {
                return value;
            }
        }
        return undefined;
    }

    export function findLast<T, U extends T>(array: readonly T[], predicate: (element: T, index: number) => element is U): U | undefined;
    export function findLast<T>(array: readonly T[], predicate: (element: T, index: number) => boolean): T | undefined;
    export function findLast<T>(array: readonly T[], predicate: (element: T, index: number) => boolean): T | undefined {
        for (let i = array.length - 1; i >= 0; i--) {
            const value = array[i];
            if (predicate(value, i)) {
                return value;
            }
        }
        return undefined;
    }

    /** Works like Array.prototype.findIndex, returning `-1` if no element satisfying the predicate is found. */
    export function findIndex<T>(array: readonly T[], predicate: (element: T, index: number) => boolean, startIndex?: number): number {
        for (let i = startIndex || 0; i < array.length; i++) {
            if (predicate(array[i], i)) {
                return i;
            }
        }
        return -1;
    }

    export function findLastIndex<T>(array: readonly T[], predicate: (element: T, index: number) => boolean, startIndex?: number): number {
        for (let i = startIndex === undefined ? array.length - 1 : startIndex; i >= 0; i--) {
            if (predicate(array[i], i)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Returns the first truthy result of `callback`, or else fails.
     * This is like `forEach`, but never returns undefined.
     */
    export function findMap<T, U>(array: readonly T[], callback: (element: T, index: number) => U | undefined): U {
        for (let i = 0; i < array.length; i++) {
            const result = callback(array[i], i);
            if (result) {
                return result;
            }
        }
        return Debug.fail();
    }

    export function contains<T>(array: readonly T[] | undefined, value: T, equalityComparer: EqualityComparer<T> = equateValues): boolean {
        if (array) {
            for (const v of array) {
                if (equalityComparer(v, value)) {
                    return true;
                }
            }
        }
        return false;
    }

    export function arraysEqual<T>(a: readonly T[], b: readonly T[], equalityComparer: EqualityComparer<T> = equateValues): boolean {
        return a.length === b.length && a.every((x, i) => equalityComparer(x, b[i]));
    }

    export function indexOfAnyCharCode(text: string, charCodes: readonly number[], start?: number): number {
        for (let i = start || 0; i < text.length; i++) {
            if (contains(charCodes, text.charCodeAt(i))) {
                return i;
            }
        }
        return -1;
    }

    export function countWhere<T>(array: readonly T[] | undefined, predicate: (x: T, i: number) => boolean): number {
        let count = 0;
        if (array) {
            for (let i = 0; i < array.length; i++) {
                const v = array[i];
                if (predicate(v, i)) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Filters an array by a predicate function. Returns the same array instance if the predicate is
     * true for all elements, otherwise returns a new array instance containing the filtered subset.
     */
    export function filter<T, U extends T>(array: T[], f: (x: T) => x is U): U[];
    export function filter<T>(array: T[], f: (x: T) => boolean): T[];
    export function filter<T, U extends T>(array: readonly T[], f: (x: T) => x is U): readonly U[];
    export function filter<T, U extends T>(array: readonly T[], f: (x: T) => boolean): readonly T[];
    export function filter<T, U extends T>(array: T[] | undefined, f: (x: T) => x is U): U[] | undefined;
    export function filter<T>(array: T[] | undefined, f: (x: T) => boolean): T[] | undefined;
    export function filter<T, U extends T>(array: readonly T[] | undefined, f: (x: T) => x is U): readonly U[] | undefined;
    export function filter<T, U extends T>(array: readonly T[] | undefined, f: (x: T) => boolean): readonly T[] | undefined;
    export function filter<T>(array: readonly T[] | undefined, f: (x: T) => boolean): readonly T[] | undefined {
        if (array) {
            const len = array.length;
            let i = 0;
            while (i < len && f(array[i])) i++;
            if (i < len) {
                const result = array.slice(0, i);
                i++;
                while (i < len) {
                    const item = array[i];
                    if (f(item)) {
                        result.push(item);
                    }
                    i++;
                }
                return result;
            }
        }
        return array;
    }

    export function filterMutate<T>(array: T[], f: (x: T, i: number, array: T[]) => boolean): void {
        let outIndex = 0;
        for (let i = 0; i < array.length; i++) {
            if (f(array[i], i, array)) {
                array[outIndex] = array[i];
                outIndex++;
            }
        }
        array.length = outIndex;
    }

    export function clear(array: {}[]): void {
        array.length = 0;
    }

    export function map<T, U>(array: readonly T[], f: (x: T, i: number) => U): U[];
    export function map<T, U>(array: readonly T[] | undefined, f: (x: T, i: number) => U): U[] | undefined;
    export function map<T, U>(array: readonly T[] | undefined, f: (x: T, i: number) => U): U[] | undefined {
        let result: U[] | undefined;
        if (array) {
            result = [];
            for (let i = 0; i < array.length; i++) {
                result.push(f(array[i], i));
            }
        }
        return result;
    }


    export function mapIterator<T, U>(iter: Iterator<T>, mapFn: (x: T) => U): Iterator<U> {
        return {
            next() {
                const iterRes = iter.next();
                return iterRes.done ? iterRes as { done: true, value: never } : { value: mapFn(iterRes.value), done: false };
            }
        };
    }

    // Maps from T to T and avoids allocation if all elements map to themselves
    export function sameMap<T>(array: T[], f: (x: T, i: number) => T): T[];
    export function sameMap<T>(array: readonly T[], f: (x: T, i: number) => T): readonly T[];
    export function sameMap<T>(array: T[] | undefined, f: (x: T, i: number) => T): T[] | undefined;
    export function sameMap<T>(array: readonly T[] | undefined, f: (x: T, i: number) => T): readonly T[] | undefined;
    export function sameMap<T>(array: readonly T[] | undefined, f: (x: T, i: number) => T): readonly T[] | undefined {
        if (array) {
            for (let i = 0; i < array.length; i++) {
                const item = array[i];
                const mapped = f(item, i);
                if (item !== mapped) {
                    const result = array.slice(0, i);
                    result.push(mapped);
                    for (i++; i < array.length; i++) {
                        result.push(f(array[i], i));
                    }
                    return result;
                }
            }
        }
        return array;
    }

    /**
     * Flattens an array containing a mix of array or non-array elements.
     *
     * @param array The array to flatten.
     */
    export function flatten<T>(array: T[][] | readonly (T | readonly T[] | undefined)[]): T[] {
        const result = [];
        for (const v of array) {
            if (v) {
                if (isArray(v)) {
                    addRange(result, v);
                }
                else {
                    result.push(v);
                }
            }
        }
        return result;
    }

    /**
     * Maps an array. If the mapped value is an array, it is spread into the result.
     *
     * @param array The array to map.
     * @param mapfn The callback used to map the result into one or more values.
     */
    export function flatMap<T, U>(array: readonly T[] | undefined, mapfn: (x: T, i: number) => U | readonly U[] | undefined): readonly U[] {
        let result: U[] | undefined;
        if (array) {
            for (let i = 0; i < array.length; i++) {
                const v = mapfn(array[i], i);
                if (v) {
                    if (isArray(v)) {
                        result = addRange(result, v);
                    }
                    else {
                        result = append(result, v);
                    }
                }
            }
        }
        return result || emptyArray;
    }

    export function flatMapToMutable<T, U>(array: readonly T[] | undefined, mapfn: (x: T, i: number) => U | readonly U[] | undefined): U[] {
        const result: U[] = [];
        if (array) {
            for (let i = 0; i < array.length; i++) {
                const v = mapfn(array[i], i);
                if (v) {
                    if (isArray(v)) {
                        addRange(result, v);
                    }
                    else {
                        result.push(v);
                    }
                }
            }
        }
        return result;
    }

    export function flatMapIterator<T, U>(iter: Iterator<T>, mapfn: (x: T) => readonly U[] | Iterator<U> | undefined): Iterator<U> {
        const first = iter.next();
        if (first.done) {
            return emptyIterator;
        }
        let currentIter = getIterator(first.value);
        return {
            next() {
                while (true) {
                    const currentRes = currentIter.next();
                    if (!currentRes.done) {
                        return currentRes;
                    }
                    const iterRes = iter.next();
                    if (iterRes.done) {
                        return iterRes as { done: true, value: never };
                    }
                    currentIter = getIterator(iterRes.value);
                }
            },
        };

        function getIterator(x: T): Iterator<U> {
            const res = mapfn(x);
            return res === undefined ? emptyIterator : isArray(res) ? arrayIterator(res) : res;
        }
    }

    /**
     * Maps an array. If the mapped value is an array, it is spread into the result.
     * Avoids allocation if all elements map to themselves.
     *
     * @param array The array to map.
     * @param mapfn The callback used to map the result into one or more values.
     */
    export function sameFlatMap<T>(array: T[], mapfn: (x: T, i: number) => T | readonly T[]): T[];
    export function sameFlatMap<T>(array: readonly T[], mapfn: (x: T, i: number) => T | readonly T[]): readonly T[];
    export function sameFlatMap<T>(array: T[], mapfn: (x: T, i: number) => T | T[]): T[] {
        let result: T[] | undefined;
        if (array) {
            for (let i = 0; i < array.length; i++) {
                const item = array[i];
                const mapped = mapfn(item, i);
                if (result || item !== mapped || isArray(mapped)) {
                    if (!result) {
                        result = array.slice(0, i);
                    }
                    if (isArray(mapped)) {
                        addRange(result, mapped);
                    }
                    else {
                        result.push(mapped);
                    }
                }
            }
        }
        return result || array;
    }

    export function mapAllOrFail<T, U>(array: readonly T[], mapFn: (x: T, i: number) => U | undefined): U[] | undefined {
        const result: U[] = [];
        for (let i = 0; i < array.length; i++) {
            const mapped = mapFn(array[i], i);
            if (mapped === undefined) {
                return undefined;
            }
            result.push(mapped);
        }
        return result;
    }

    export function mapDefined<T, U>(array: readonly T[] | undefined, mapFn: (x: T, i: number) => U | undefined): U[] {
        const result: U[] = [];
        if (array) {
            for (let i = 0; i < array.length; i++) {
                const mapped = mapFn(array[i], i);
                if (mapped !== undefined) {
                    result.push(mapped);
                }
            }
        }
        return result;
    }

    export function mapDefinedIterator<T, U>(iter: Iterator<T>, mapFn: (x: T) => U | undefined): Iterator<U> {
        return {
            next() {
                while (true) {
                    const res = iter.next();
                    if (res.done) {
                        return res as { done: true, value: never };
                    }
                    const value = mapFn(res.value);
                    if (value !== undefined) {
                        return { value, done: false };
                    }
                }
            }
        };
    }

    export function mapDefinedEntries<K1, V1, K2, V2>(map: ReadonlyESMap<K1, V1>, f: (key: K1, value: V1) => readonly [K2, V2] | undefined): ESMap<K2, V2>;
    export function mapDefinedEntries<K1, V1, K2, V2>(map: ReadonlyESMap<K1, V1> | undefined, f: (key: K1, value: V1) => readonly [K2 | undefined, V2 | undefined] | undefined): ESMap<K2, V2> | undefined;
    export function mapDefinedEntries<K1, V1, K2, V2>(map: ReadonlyESMap<K1, V1> | undefined, f: (key: K1, value: V1) => readonly [K2 | undefined, V2 | undefined] | undefined): ESMap<K2, V2> | undefined {
        if (!map) {
            return undefined;
        }

        const result = new Map<K2, V2>();
        map.forEach((value, key) => {
            const entry = f(key, value);
            if (entry !== undefined) {
                const [newKey, newValue] = entry;
                if (newKey !== undefined && newValue !== undefined) {
                    result.set(newKey, newValue);
                }
            }
        });

        return result;
    }

    export function mapDefinedValues<V1, V2>(set: ReadonlySet<V1>, f: (value: V1) => V2 | undefined): Set<V2>;
    export function mapDefinedValues<V1, V2>(set: ReadonlySet<V1> | undefined, f: (value: V1) => V2 | undefined): Set<V2> | undefined;
    export function mapDefinedValues<V1, V2>(set: ReadonlySet<V1> | undefined, f: (value: V1) => V2 | undefined): Set<V2> | undefined {
        if (set) {
            const result = new Set<V2>();
            set.forEach(value => {
                const newValue = f(value);
                if (newValue !== undefined) {
                    result.add(newValue);
                }
            });
            return result;
        }
    }

    export function getOrUpdate<K, V>(map: ESMap<K, V>, key: K, callback: () => V) {
        if (map.has(key)) {
            return map.get(key)!;
        }
        const value = callback();
        map.set(key, value);
        return value;
    }

    export function tryAddToSet<T>(set: Set<T>, value: T) {
        if (!set.has(value)) {
            set.add(value);
            return true;
        }
        return false;
    }

    export const emptyIterator: Iterator<never> = { next: () => ({ value: undefined as never, done: true }) };

    export function singleIterator<T>(value: T): Iterator<T> {
        let done = false;
        return {
            next() {
                const wasDone = done;
                done = true;
                return wasDone ? { value: undefined as never, done: true } : { value, done: false };
            }
        };
    }

    /**
     * Maps contiguous spans of values with the same key.
     *
     * @param array The array to map.
     * @param keyfn A callback used to select the key for an element.
     * @param mapfn A callback used to map a contiguous chunk of values to a single value.
     */
    export function spanMap<T, K, U>(array: readonly T[], keyfn: (x: T, i: number) => K, mapfn: (chunk: T[], key: K, start: number, end: number) => U): U[];
    export function spanMap<T, K, U>(array: readonly T[] | undefined, keyfn: (x: T, i: number) => K, mapfn: (chunk: T[], key: K, start: number, end: number) => U): U[] | undefined;
    export function spanMap<T, K, U>(array: readonly T[] | undefined, keyfn: (x: T, i: number) => K, mapfn: (chunk: T[], key: K, start: number, end: number) => U): U[] | undefined {
        let result: U[] | undefined;
        if (array) {
            result = [];
            const len = array.length;
            let previousKey: K | undefined;
            let key: K | undefined;
            let start = 0;
            let pos = 0;
            while (start < len) {
                while (pos < len) {
                    const value = array[pos];
                    key = keyfn(value, pos);
                    if (pos === 0) {
                        previousKey = key;
                    }
                    else if (key !== previousKey) {
                        break;
                    }

                    pos++;
                }

                if (start < pos) {
                    const v = mapfn(array.slice(start, pos), previousKey!, start, pos);
                    if (v) {
                        result.push(v);
                    }

                    start = pos;
                }

                previousKey = key;
                pos++;
            }
        }

        return result;
    }

    export function mapEntries<K1, V1, K2, V2>(map: ReadonlyESMap<K1, V1>, f: (key: K1, value: V1) => readonly [K2, V2]): ESMap<K2, V2>;
    export function mapEntries<K1, V1, K2, V2>(map: ReadonlyESMap<K1, V1> | undefined, f: (key: K1, value: V1) => readonly [K2, V2]): ESMap<K2, V2> | undefined;
    export function mapEntries<K1, V1, K2, V2>(map: ReadonlyESMap<K1, V1> | undefined, f: (key: K1, value: V1) => readonly [K2, V2]): ESMap<K2, V2> | undefined {
        if (!map) {
            return undefined;
        }

        const result = new Map<K2, V2>();
        map.forEach((value, key) => {
            const [newKey, newValue] = f(key, value);
            result.set(newKey, newValue);
        });
        return result;
    }

    export function some<T>(array: readonly T[] | undefined): array is readonly T[];
    export function some<T>(array: readonly T[] | undefined, predicate: (value: T) => boolean): boolean;
    export function some<T>(array: readonly T[] | undefined, predicate?: (value: T) => boolean): boolean {
        if (array) {
            if (predicate) {
                for (const v of array) {
                    if (predicate(v)) {
                        return true;
                    }
                }
            }
            else {
                return array.length > 0;
            }
        }
        return false;
    }

    /** Calls the callback with (start, afterEnd) index pairs for each range where 'pred' is true. */
    export function getRangesWhere<T>(arr: readonly T[], pred: (t: T) => boolean, cb: (start: number, afterEnd: number) => void): void {
        let start: number | undefined;
        for (let i = 0; i < arr.length; i++) {
            if (pred(arr[i])) {
                start = start === undefined ? i : start;
            }
            else {
                if (start !== undefined) {
                    cb(start, i);
                    start = undefined;
                }
            }
        }
        if (start !== undefined) cb(start, arr.length);
    }

    export function concatenate<T>(array1: T[], array2: T[]): T[];
    export function concatenate<T>(array1: readonly T[], array2: readonly T[]): readonly T[];
    export function concatenate<T>(array1: T[] | undefined, array2: T[] | undefined): T[];
    export function concatenate<T>(array1: readonly T[] | undefined, array2: readonly T[] | undefined): readonly T[];
    export function concatenate<T>(array1: T[], array2: T[]): T[] {
        if (!some(array2)) return array1;
        if (!some(array1)) return array2;
        return [...array1, ...array2];
    }

    function selectIndex(_: unknown, i: number) {
        return i;
    }

    export function indicesOf(array: readonly unknown[]): number[] {
        return array.map(selectIndex);
    }

    function deduplicateRelational<T>(array: readonly T[], equalityComparer: EqualityComparer<T>, comparer: Comparer<T>) {
        // Perform a stable sort of the array. This ensures the first entry in a list of
        // duplicates remains the first entry in the result.
        const indices = indicesOf(array);
        stableSortIndices(array, indices, comparer);

        let last = array[indices[0]];
        const deduplicated: number[] = [indices[0]];
        for (let i = 1; i < indices.length; i++) {
            const index = indices[i];
            const item = array[index];
            if (!equalityComparer(last, item)) {
                deduplicated.push(index);
                last = item;
            }
        }

        // restore original order
        deduplicated.sort();
        return deduplicated.map(i => array[i]);
    }

    function deduplicateEquality<T>(array: readonly T[], equalityComparer: EqualityComparer<T>) {
        const result: T[] = [];
        for (const item of array) {
            pushIfUnique(result, item, equalityComparer);
        }
        return result;
    }

    /**
     * Deduplicates an unsorted array.
     * @param equalityComparer An `EqualityComparer` used to determine if two values are duplicates.
     * @param comparer An optional `Comparer` used to sort entries before comparison, though the
     * result will remain in the original order in `array`.
     */
    export function deduplicate<T>(array: readonly T[], equalityComparer: EqualityComparer<T>, comparer?: Comparer<T>): T[] {
        return array.length === 0 ? [] :
            array.length === 1 ? array.slice() :
            comparer ? deduplicateRelational(array, equalityComparer, comparer) :
            deduplicateEquality(array, equalityComparer);
    }

    /**
     * Deduplicates an array that has already been sorted.
     */
    function deduplicateSorted<T>(array: SortedReadonlyArray<T>, comparer: EqualityComparer<T> | Comparer<T>): SortedReadonlyArray<T> {
        if (array.length === 0) return emptyArray as any as SortedReadonlyArray<T>;

        let last = array[0];
        const deduplicated: T[] = [last];
        for (let i = 1; i < array.length; i++) {
            const next = array[i];
            switch (comparer(next, last)) {
                // equality comparison
                case true:

                // relational comparison
                // falls through
                case Comparison.EqualTo:
                    continue;

                case Comparison.LessThan:
                    // If `array` is sorted, `next` should **never** be less than `last`.
                    return Debug.fail("Array is unsorted.");
            }

            deduplicated.push(last = next);
        }

        return deduplicated as any as SortedReadonlyArray<T>;
    }

    export function insertSorted<T>(array: SortedArray<T>, insert: T, compare: Comparer<T>): void {
        if (array.length === 0) {
            array.push(insert);
            return;
        }

        const insertIndex = binarySearch(array, insert, identity, compare);
        if (insertIndex < 0) {
            array.splice(~insertIndex, 0, insert);
        }
    }

    export function sortAndDeduplicate<T>(array: readonly string[]): SortedReadonlyArray<string>;
    export function sortAndDeduplicate<T>(array: readonly T[], comparer: Comparer<T>, equalityComparer?: EqualityComparer<T>): SortedReadonlyArray<T>;
    export function sortAndDeduplicate<T>(array: readonly T[], comparer?: Comparer<T>, equalityComparer?: EqualityComparer<T>): SortedReadonlyArray<T> {
        return deduplicateSorted(sort(array, comparer), equalityComparer || comparer || compareStringsCaseSensitive as any as Comparer<T>);
    }

    export function arrayIsSorted<T>(array: readonly T[], comparer: Comparer<T>) {
        if (array.length < 2) return true;
        let prevElement = array[0];
        for (const element of array.slice(1)) {
            if (comparer(prevElement, element) === Comparison.GreaterThan) {
                return false;
            }
            prevElement = element;
        }
        return true;
    }

    export function arrayIsEqualTo<T>(array1: readonly T[] | undefined, array2: readonly T[] | undefined, equalityComparer: (a: T, b: T, index: number) => boolean = equateValues): boolean {
        if (!array1 || !array2) {
            return array1 === array2;
        }

        if (array1.length !== array2.length) {
            return false;
        }

        for (let i = 0; i < array1.length; i++) {
            if (!equalityComparer(array1[i], array2[i], i)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Compacts an array, removing any falsey elements.
     */
    export function compact<T>(array: (T | undefined | null | false | 0 | "")[]): T[];
    export function compact<T>(array: readonly (T | undefined | null | false | 0 | "")[]): readonly T[];
    // ESLint thinks these can be combined with the above - they cannot; they'd produce higher-priority inferences and prevent the falsey types from being stripped
    export function compact<T>(array: T[]): T[]; // eslint-disable-line @typescript-eslint/unified-signatures
    export function compact<T>(array: readonly T[]): readonly T[]; // eslint-disable-line @typescript-eslint/unified-signatures
    export function compact<T>(array: T[]): T[] {
        let result: T[] | undefined;
        if (array) {
            for (let i = 0; i < array.length; i++) {
                const v = array[i];
                if (result || !v) {
                    if (!result) {
                        result = array.slice(0, i);
                    }
                    if (v) {
                        result.push(v);
                    }
                }
            }
        }
        return result || array;
    }

    /**
     * Gets the relative complement of `arrayA` with respect to `arrayB`, returning the elements that
     * are not present in `arrayA` but are present in `arrayB`. Assumes both arrays are sorted
     * based on the provided comparer.
     */
    export function relativeComplement<T>(arrayA: T[] | undefined, arrayB: T[] | undefined, comparer: Comparer<T>): T[] | undefined {
        if (!arrayB || !arrayA || arrayB.length === 0 || arrayA.length === 0) return arrayB;
        const result: T[] = [];
        loopB: for (let offsetA = 0, offsetB = 0; offsetB < arrayB.length; offsetB++) {
            if (offsetB > 0) {
                // Ensure `arrayB` is properly sorted.
                Debug.assertGreaterThanOrEqual(comparer(arrayB[offsetB], arrayB[offsetB - 1]), Comparison.EqualTo);
            }

            loopA: for (const startA = offsetA; offsetA < arrayA.length; offsetA++) {
                if (offsetA > startA) {
                    // Ensure `arrayA` is properly sorted. We only need to perform this check if
                    // `offsetA` has changed since we entered the loop.
                    Debug.assertGreaterThanOrEqual(comparer(arrayA[offsetA], arrayA[offsetA - 1]), Comparison.EqualTo);
                }

                switch (comparer(arrayB[offsetB], arrayA[offsetA])) {
                    case Comparison.LessThan:
                        // If B is less than A, B does not exist in arrayA. Add B to the result and
                        // move to the next element in arrayB without changing the current position
                        // in arrayA.
                        result.push(arrayB[offsetB]);
                        continue loopB;
                    case Comparison.EqualTo:
                        // If B is equal to A, B exists in arrayA. Move to the next element in
                        // arrayB without adding B to the result or changing the current position
                        // in arrayA.
                        continue loopB;
                    case Comparison.GreaterThan:
                        // If B is greater than A, we need to keep looking for B in arrayA. Move to
                        // the next element in arrayA and recheck.
                        continue loopA;
                }
            }
        }
        return result;
    }

    export function sum<T extends Record<K, number>, K extends string>(array: readonly T[], prop: K): number {
        let result = 0;
        for (const v of array) {
            result += v[prop];
        }
        return result;
    }

    /**
     * Appends a value to an array, returning the array.
     *
     * @param to The array to which `value` is to be appended. If `to` is `undefined`, a new array
     * is created if `value` was appended.
     * @param value The value to append to the array. If `value` is `undefined`, nothing is
     * appended.
     */
    export function append<TArray extends any[] | undefined, TValue extends NonNullable<TArray>[number] | undefined>(to: TArray, value: TValue): [undefined, undefined] extends [TArray, TValue] ? TArray : NonNullable<TArray>[number][];
    export function append<T>(to: T[], value: T | undefined): T[];
    export function append<T>(to: T[] | undefined, value: T): T[];
    export function append<T>(to: T[] | undefined, value: T | undefined): T[] | undefined;
    export function append<T>(to: Push<T>, value: T | undefined): void;
    export function append<T>(to: T[], value: T | undefined): T[] | undefined {
        if (value === undefined) return to;
        if (to === undefined) return [value];
        to.push(value);
        return to;
    }

    /**
     * Combines two arrays, values, or undefineds into the smallest container that can accommodate the resulting set:
     *
     * ```
     * undefined -> undefined -> undefined
     * T -> undefined -> T
     * T -> T -> T[]
     * T[] -> undefined -> T[] (no-op)
     * T[] -> T -> T[]         (append)
     * T[] -> T[] -> T[]       (concatenate)
     * ```
     */
    export function combine<T>(xs: T | readonly T[] | undefined, ys: T | readonly T[] | undefined): T | readonly T[] | undefined;
    export function combine<T>(xs: T | T[] | undefined, ys: T | T[] | undefined): T | T[] | undefined;
    export function combine<T>(xs: T | T[] | undefined, ys: T | T[] | undefined) {
        if (xs === undefined) return ys;
        if (ys === undefined) return xs;
        if (isArray(xs)) return isArray(ys) ? concatenate(xs, ys) : append(xs, ys);
        if (isArray(ys)) return append(ys, xs);
        return [xs, ys];
    }

    /**
     * Gets the actual offset into an array for a relative offset. Negative offsets indicate a
     * position offset from the end of the array.
     */
    function toOffset(array: readonly any[], offset: number) {
        return offset < 0 ? array.length + offset : offset;
    }

    /**
     * Appends a range of value to an array, returning the array.
     *
     * @param to The array to which `value` is to be appended. If `to` is `undefined`, a new array
     * is created if `value` was appended.
     * @param from The values to append to the array. If `from` is `undefined`, nothing is
     * appended. If an element of `from` is `undefined`, that element is not appended.
     * @param start The offset in `from` at which to start copying values.
     * @param end The offset in `from` at which to stop copying values (non-inclusive).
     */
    export function addRange<T>(to: T[], from: readonly T[] | undefined, start?: number, end?: number): T[];
    export function addRange<T>(to: T[] | undefined, from: readonly T[] | undefined, start?: number, end?: number): T[] | undefined;
    export function addRange<T>(to: T[] | undefined, from: readonly T[] | undefined, start?: number, end?: number): T[] | undefined {
        if (from === undefined || from.length === 0) return to;
        if (to === undefined) return from.slice(start, end);
        start = start === undefined ? 0 : toOffset(from, start);
        end = end === undefined ? from.length : toOffset(from, end);
        for (let i = start; i < end && i < from.length; i++) {
            if (from[i] !== undefined) {
                to.push(from[i]);
            }
        }
        return to;
    }

    /**
     * @return Whether the value was added.
     */
    export function pushIfUnique<T>(array: T[], toAdd: T, equalityComparer?: EqualityComparer<T>): boolean {
        if (contains(array, toAdd, equalityComparer)) {
            return false;
        }
        else {
            array.push(toAdd);
            return true;
        }
    }

    /**
     * Unlike `pushIfUnique`, this can take `undefined` as an input, and returns a new array.
     */
    export function appendIfUnique<T>(array: T[] | undefined, toAdd: T, equalityComparer