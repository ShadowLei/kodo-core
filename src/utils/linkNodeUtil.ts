import { LinkExpression, LinkOperator, ROperator } from "../expressions";
import { LinkNode } from "../nodes";

export class LinkNodeUtil {
    private static revertExpression<TFrom, TTo>(origin: LinkExpression<TFrom, TTo>): LinkExpression<TTo, TFrom> {
        if (typeof origin === "function") {
            // throw new Error("TODO: Not Implemented.");
            
            //If it's expression, should be always "single" | ->
            return null;
        }

        let rtn: LinkExpression<TTo, TFrom> = {
            $from: origin.$to,
            $to: origin.$from,
            // $with: origin.$with,
            // $where: []
        };

        //when ==, means A->B && B->A
        if (origin.$op === "==") {
            rtn.$op = origin.$op;

            // TMP: remove as not consider well.
            // origin.$where?.forEach(m => {
            //     let r = LinkNodeUtil.revertExpression(m);
            //     if (r) { rtn.$where.push(r); }
            // });
            return rtn;
        }

        return null;
    }

    static revert<TFrom, TTo>(node: LinkNode<TFrom, TTo>): LinkNode<TTo, TFrom> | null {

        let rExp = LinkNodeUtil.revertExpression(node.expression);
        if (!rExp) { return null; }

        let rtn: LinkNode<TTo, TFrom> = new LinkNode<TTo, TFrom>();
        rtn.$id = `${node.$id}-r`;
        rtn.$from = node.$to;
        rtn.$to = node.$from;
        rtn.expression = rExp;

        return rtn;
    }

    // static revertLinkOperator(op: LinkOperator): LinkOperator | null {
    //     switch(op) {
    //         case ">":
    //             return "<";
    //         case ">=":
    //             return "<=";
    //         case "<":
    //             return ">";
    //         case "<=":
    //             return ">=";
    //         case "->":  //single op
    //             return null;
    //         default:
    //             return op;
    //     }
    // }
    
    static convertLP2RO(op: LinkOperator): ROperator | null {
        switch (op) {
            case "->":  //single op
                return "==";
            default:
                return op;
        }
    }
}