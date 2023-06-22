
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

export function generateHashCode(obj: any,
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

    //console.warn(hash);

    return hash.toString();
}
