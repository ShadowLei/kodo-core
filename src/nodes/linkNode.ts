import { LinkExpression, NodeNamespace } from "../expressions";

export class LinkNode<TFrom, TTo> {
    $id?: string;

    $from: NodeNamespace<TFrom>;
    $to: NodeNamespace<TTo>;

    expression: LinkExpression<TFrom, TTo>;
}