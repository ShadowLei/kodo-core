import { QueryExpression } from "../expressions/queryExpression";
import { DataNode } from "./dataNode";
import { LinkNode } from "./linkNode";
import { NodeBase } from "./nodeBase";

export class QueryNode<T> extends NodeBase {
    $fromDN?: DataNode<any>;
    $fromLN?: LinkNode<any, T>;

    //强制 limit（由 Kodo 在 lookup 前写入，provider 据此限制返回条数）
    $limit?: number;

    expression: QueryExpression<T>;
}
