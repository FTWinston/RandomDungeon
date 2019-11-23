export function distinct<T>(items: T[]) {
    const existing = new Set<T>();
    const distinctItems: T[] = [];

    for (const item of items) {
        if (!existing.has(item)) {
            existing.add(item);
            distinctItems.push(item);
        }
    }

    return distinctItems;
}

export function distinctMulti<T>(itemSets: T[][]) {
    const existing = new Set<T>();
    const distinctItems: T[] = [];

    for (const itemSet of itemSets) {
        for (const item of itemSet) {
            if (!existing.has(item)) {
                existing.add(item);
                distinctItems.push(item);
            }
        }
    }

    return distinctItems;
}