import { QueryExpression } from "../expressions/queryExpression";
import { DataNode } from "./dataNode";
import { LinkNode } from "./linkNode";

export class QueryNode<T> {
    $id?: string;
    $ns: string;

    $fromDN?: DataNode<any>;
    $fromLN?: LinkNode<any, T>;

    expression: QueryExpression<T>;
}
