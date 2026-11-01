

export function isNullOrUndefined(obj: any) {
    return (obj === null || obj === undefined);
}

//try get IKodoID
function getGetter(classMap: Record<string, any>, name: string, obj: any): string | null {
    let cls = classMap[name];
    if (!cls) { return null; }

    const descriptor = Object.getOwnPropertyDescriptor(cls.prototype, '$id');

    if (descriptor?.get) {
        const value = descriptor.get.call(obj) || null;  // ✅ 以 a 为 this 调用 getter
        // console.log(`value get: ${value}`);  // "sdf"
        return value;
    }

    return null;
}

export function tryGetKodoId() {

}