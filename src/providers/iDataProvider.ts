import { DataNode, QueryNode } from "../nodes";

export interface IDataProvider {
    lookup<T>(node: QueryNode<T>): Promise<DataNode<any>[]>;
}
