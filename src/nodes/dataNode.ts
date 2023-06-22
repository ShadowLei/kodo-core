import { NodeBase } from "./nodeBase";
import { QueryNode } from "./queryNode";

/*
export type DataNodeObject<T> = {
    [P in keyof T]?: {
        //$expression?: LinkExpression;
        $from?: QueryNode<T>;
        $val: T[P];
    };
};
*/

export class DataNode<T> extends NodeBase {
    $fromQN?: QueryNode<T>;

    data: Partial<T>;
}

export class DataNodeMap {
    nodes: Map<string, DataNode<any>>;
    ns: Map<string, DataNode<any>[]>;

    constructor() {
        this.nodes = new Map<string, DataNode<any>>();
        this.ns = new Map<string, DataNode<any>[]>();
    }

    tryAdd<T>(node: DataNode<T>): boolean {
        let nodeid = `${node.$ns}-${node.$id}`;

        //do not add if exist.
        if (this.nodes.get(nodeid)) {
            return false;
        }

        //add node map
        this.nodes.set(nodeid, node);

        //add ns map
        let nodeNS = this.ns.get(node.$ns);
        if (!nodeNS) {
            nodeNS = [];
            this.ns.set(node.$ns, nodeNS);
        }
        nodeNS.push(node);

        return true;
    }

    getList(): DataNode<any>[] {
        return Array.from(this.nodes.values());
    }

    clear(): void {
        this.nodes.clear();
        this.ns.clear();
    }

    existNS(ns: string): boolean {
        let rtn = this.ns.get(ns);

        return !!rtn;
    }
}