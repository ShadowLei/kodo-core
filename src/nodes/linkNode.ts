import { LinkExpression } from "../expressions";
import { NodeBase } from "./nodeBase";

export class LinkNode<TFrom, TTo> extends NodeBase {
    $fromNS: string;
    $toNS: string;

    expression: LinkExpression<TFrom, TTo>;

    private static revertExpression<TFrom, TTo>(origin: LinkExpression<TFrom, TTo>): LinkExpression<TTo, TFrom> {
        let rtn: LinkExpression<TTo, TFrom> = {
            $from: origin.$to,
            $to: origin.$from,
            $with: origin.$with,
            $where: []
        };

        //when ==, means A->B && B->A
        if (origin.$op === "==") {
            rtn.$op = origin.$op;
            origin.$where?.forEach(m => {
                let r = this.revertExpression(m);
                if (r) { rtn.$where.push(r); }
            });
        }

        return rtn;
    }

    static revert<TFrom, TTo>(node: LinkNode<TFrom, TTo>): LinkNode<TTo, TFrom> | null {
        let rExp = LinkNode.revertExpression(node.expression);
        if (!rExp) { return null; }

        let rtn: LinkNode<TTo, TFrom> = new LinkNode<TTo, TFrom>();
        rtn.$id = `${node.$id}-r`;
        rtn.$ns = node.$ns;
        rtn.$fromNS = node.$toNS;
        rtn.$toNS = node.$fromNS;
        rtn.expression = rExp;

        return rtn;
    }
}
