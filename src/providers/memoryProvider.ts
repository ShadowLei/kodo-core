import { DataNode } from "../nodes";
import { QueryNode } from "../nodes/queryNode";
import { NodeNamespace } from "../expressions";
import { IDataProvider } from "./iDataProvider";
import { generateHashCode } from "../utils";
import { match } from "../utils/expressionMatcher";
import { Kodo } from "../kodo";

class MemoryData<T> {
    ns: NodeNamespace<T>;
    val: T;
}

export class MemoryProvider implements IDataProvider {
    kodo: Kodo;
    private objs: MemoryData<any>[];

    constructor() {
        this.objs = [];
    }

    getNameNs<T>(x: NodeNamespace<T>): string {
        return (typeof x === "function") ? x.name : x;
    }

    add<T>(namespace: NodeNamespace<T>, obj: Partial<T>) {
        this.objs.push({
            ns: namespace,
            val: obj
        });
    }

    async lookup<T>(qNode: QueryNode<T>): Promise<DataNode<any>[]> {
        let matched = this.objs.filter(m => this.getNameNs(m.ns) === qNode.$ns);

        //find match
        let list = matched.filter(m => {
            let rtn = match(qNode.expression, m.val);

            //regards the final "defer" as false
            if (rtn === "defer") { return false; }
            else { return rtn; }
        });

        //apply forced limit
        list = list.slice(0, this.kodo.opt.limit);

        //convert to data node
        let rtn = list.map(m => {
            let node = new DataNode<T>();
            node.$fromQN.push(qNode);
            node.$ns = this.getNameNs(m.ns);
            node.data = m.val;
            node.$id = this.kodo.tryGetObjectId(m.val, node.$ns) || m.val?.id || `${qNode.$ns}-${generateHashCode(m.val)}`;
            return node;
        });

        return rtn;
    }
}