import {decycle, retrocycle} from "json-cycle";

export function isNullOrUndefined(obj: any) {
    return (obj === null || obj === undefined);
}

export function wrap(obj: any): any {
    let v = JSON.stringify(decycle(obj));
    return retrocycle(JSON.parse(v));
}
