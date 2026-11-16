import { decycle, retrocycle } from "json-decycle";

export function isNullOrUndefined(obj: any) {
    return (obj === null || obj === undefined);
}

export function wrap(obj: any): any {
    // let v = devalue.stringify(obj);
    // return devalue.parse(v);
    let v = JSON.stringify(obj, decycle());
    return JSON.parse(v, retrocycle());
}
