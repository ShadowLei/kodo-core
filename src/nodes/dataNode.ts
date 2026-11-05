import { QueryNode } from "./queryNode";

export class DataNode<T> {
    $id?: number | string;
    $ns: string;

    $fromQN: QueryNode<T>[];
    data: Partial<T>;

    constructor() {
        this.$fromQN = [];
    }
}

export class DataNodeMap {
    nodes: Map<string, DataNode<any>>;
    ns: Map<string, DataNode<any>[]>;

    constructor() {
        this.nodes = new Map<string, DataNode<any>>();
        this.ns = new Map<string, DataNode<any>[]>();
    }

    tryAdd<T>(node: DataNode<T>): {rtn: boolean, node: DataNode<any>} {
        let nodeid = `${node.$ns}-${node.$id}`;

        //do not add if exist.
        let exist = this.nodes.get(nodeid);
        if (exist) {
            return {rtn: false, node: exist};
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

        return { rtn: true, node: null};
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