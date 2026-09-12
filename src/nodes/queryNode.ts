import { QueryExpression } from "../expressions/queryExpression";
import { DataNode } from "./dataNode";
import { LinkNode } from "./linkNode";
import { NodeBase } from "./nodeBase";

export class QueryNode<T> extends NodeBase {
    $fromDN?: DataNode<any>;
    $fromLN?: LinkNode<any, T>;

    expression: QueryExpression<T>;
}
