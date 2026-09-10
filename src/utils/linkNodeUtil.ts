import { LinkExpression } from "../expressions";
import { LinkNode } from "../nodes";

export class LinkNodeUtil {
    private static revertExpression<TFrom, TTo>(origin: LinkExpression<TFrom, TTo>): LinkExpression<TTo, TFrom> {
        if (typeof origin === "function") {
            throw new Error("TODO: Not Implemented.");
        }

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
                let r = LinkNodeUtil.revertExpression(m);
                if (r) { rtn.$where.push(r); }
            });
        }

        return rtn;
    }

    static revert<TFrom, TTo>(node: LinkNode<TFrom, TTo>): LinkNode<TTo, TFrom> | null {

        let rExp = LinkNodeUtil.revertExpression(node.expression);
        if (!rExp) { return null; }

        let rtn: LinkNode<TTo, TFrom> = new LinkNode<TTo, TFrom>();
        rtn.$id = `${node.$id}-r`;
        // rtn.$ns = node.$ns;
        rtn.$from = node.$to;
        rtn.$to = node.$from;
        rtn.expression = rExp;

        return rtn;
    }
}