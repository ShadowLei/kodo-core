import { Kodo } from "../kodo";
import { DataNode, LinkNode, QueryNode } from "../nodes";

export interface INodeTranslator {
    kodo: Kodo;
    linkNodes: LinkNode<any, any>[];
    
    all(): LinkNode<any, any>[];
    link<TFrom, TTo>(ln: LinkNode<TFrom, TTo>): void;
    match<TFrom>(dn: DataNode<TFrom>): boolean;
    translate<TFrom, TTo>(data: DataNode<TFrom>): QueryNode<TTo>[];
}
