import { DataNode, LinkNode, QueryNode } from "../nodes";

export interface INodeTranslator {
    all(): LinkNode<any, any>[];
    link<TFrom, TTo>(ln: LinkNode<TFrom, TTo>): boolean;
    match<TFrom>(dn: DataNode<TFrom>): boolean;
    translate<TFrom, TTo>(data: DataNode<TFrom>): QueryNode<TTo>[];
}
