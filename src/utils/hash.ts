import { DataNode, QueryNode } from "../nodes";

const SEED_DEFAULT = Math.ceil(Math.random() * 100000);

function objToString(obj: any): string {
    let str = "null";
    let type = typeof obj;
    switch (type) {
        case "undefined":
            str = "undefined";
            break;
        case "string":
            str = obj;
            break;
        case "boolean":
        case "number":
        case "bigint":
        case "function":
        case "symbol":
            str = obj;
            break;
        case "object":
            try {
                obj = obj || null;
                str = JSON.stringify(obj || null);
            }
            catch(e) {
                //swallow exception
            }
            break;
        default:
            break;
    };

    return str;
}

export function generateHashCode(obj?: any,
    opt?: {
        seed?: number
    }): string {
    //let seed = opt?.seed || Math.ceil(Math.random() * 100000);
    let seed = opt?.seed || SEED_DEFAULT;

    let str = objToString(obj);
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash |= 0 //to 32bit integer
    }

    //ensure positive num
    hash = hash & 0x7FFFFFFF;

    return hash.toString();
}


export function trySetFromTo<T>(node: DataNode<T>, qNode: QueryNode<T>) {
    let fromNode = qNode.$fromDN;
    if (!fromNode) { return; }
    
    let existFrom = node.$from.find(m => m.$ns === fromNode.$ns && m.$id === fromNode.$id);
    if (!existFrom) {
        node.$from.push(fromNode);
    }

    let existTo = fromNode.$to.find(m => m.$ns === node.$ns && m.$id === node.$id);
    if (!existTo) {
        fromNode.$to.push(node);
    }
}