/**
 * Inserts `element` into `arr` if it doesn't contain `element`.
 * Note: This mutates the array in place.
 * @param arr
 * @param element
 */
export function insertUnique<T>(arr: T[], element: T): T[] {
    if (arr.includes(element)) {
        return arr;
    }

    arr.push(element);

    return arr;
}

/**
 * Returns true if `obj` has `property`
 * @param obj
 * @param property
 */
export function hasOwnProperty(
    obj: unknown,
    property: number | string,
): boolean {
    if (typeof obj !== 'object' || obj === null || obj === undefined) {
        return false;
    }

    return Object.prototype.hasOwnProperty.call(obj, property);
}
