import { Kodo } from "../kodo";
import { DataNode, QueryNode } from "../nodes";

export interface IDataProvider {
    kodo: Kodo;
    lookup<T>(node: QueryNode<T>): Promise<DataNode<any>[]>;
}
