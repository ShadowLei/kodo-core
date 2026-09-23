import { LinkExpression, LinkExpressionObject, NodeNamespace, QueryExpressionObject, QueryOnValue, convertLP2RO, isEmptyQueryExp, revertLinkOperator } from "../expressions";
import { DataNode, LinkNode, QueryNode } from "../nodes";
import { generateHashCode } from "../utils";
import { LinkNodeUtil } from "../utils/linkNodeUtil";
import { INodeTranslator } from "./iNodeTranslator";

//DataNode + LinkNode => QueryNode
export class NodeTranslator implements INodeTranslator {
    private linkNodes: LinkNode<any, any>[];

    constructor() {
        this.linkNodes = [];
    }

    all(): LinkNode<any, any>[] {
        return this.linkNodes;
    }

    //by default, always match for use.
    match<TFrom>(dn: DataNode<TFrom>): boolean {
        return true;
    }

    getNameNs<T>(x: NodeNamespace<T>): string {
        return (typeof x === "function") ? x.name : x;
    }

    link<TFrom, TTo>(ln: LinkNode<TFrom, TTo>): boolean {
        let fromName = this.getNameNs(ln.$from);
        let $toName = this.getNameNs(ln.$to)
        
        if (!ln.$id) {
            let lnid = generateHashCode(ln);
            ln.$id = `ln-${fromName}-${$toName}-${lnid}`;
        }
        this.linkNodes.push(ln);

        let revertLink = LinkNodeUtil.revert(ln);
        if (revertLink) { this.linkNodes.push(revertLink); }

        return true;
    }

    private tryMapOnData<TFrom, TTo>(rtnQE: QueryExpressionObject<TTo>, where: LinkExpressionObject<TFrom, TTo>, data: DataNode<TFrom>): boolean {
        let dataVal = data.data[where.$from];

        // console.log("===try map===")
        // console.log(data.data);
        // console.log(where.$from);
        // console.log(dataVal);

        if (dataVal === undefined) { return false; }

        let rop = revertLinkOperator(where.$op);
        if (!rop) { return false; }

        rtnQE.$with = where.$with;

        rtnQE[where.$to] ||= {} as any;
        (rtnQE[where.$to] as QueryOnValue<TTo, keyof TTo>).$op = convertLP2RO(rop);
        (rtnQE[where.$to] as QueryOnValue<TTo, keyof TTo>).$val = dataVal as any; //TODO here: better strong type?

        // console.log("===try map to ===")
        // console.log(rtnQE);
    }

    private tryMap<TFrom, TTo>(rtnQE: QueryExpressionObject<TTo>, expression: LinkExpression<TFrom, TTo>, data: DataNode<TFrom>): void {
        
        if (typeof expression === "function") {
            throw new Error("TODO: Not Implemented.");
        }

        rtnQE.$with = expression.$with;

        this.tryMapOnData(rtnQE, expression, data);

        expression.$where?.forEach(w => {
            w = w as LinkExpressionObject<TFrom, TTo>;
            let qeWhere: QueryExpressionObject<TTo> = {};
            qeWhere.$with = w.$with;
            qeWhere.$where = [];
            this.tryMap(qeWhere, w, data);
            rtnQE.$where.push(qeWhere);
        });
    }

    //DataNode + LinkNode => QueryNode
    translate<TFrom, TTo>(data: DataNode<TFrom>): QueryNode<TTo>[] {
        let rtn = [];

        let fromNodes = this.linkNodes.filter(m => this.getNameNs(m.$from) === data.$ns);

        fromNodes.forEach(ln => {
            let qn: QueryNode<TTo> = new QueryNode<TTo>();
            qn.$id = `qn-${data.$ns}-${data.$id}-${ln.$id}`;
            qn.$ns = this.getNameNs(ln.$to);
            qn.$fromDN = data;
            qn.$fromLN = ln;
            qn.expression = {};
            qn.expression.$where = [];

            /*
            let lnExp = ln.expression as LinkExpression<TFrom, TTo>
            if (typeof lnExp === "function") {
                lnExp()
                qn.expression = to => lnExp()
            }
            */

            this.tryMap(qn.expression, ln.expression as LinkExpression<TFrom, TTo>, data);

            if (isEmptyQueryExp(qn.expression)) {
                throw new Error("Where is Empty");
            }
            
            rtn.push(qn);
        });

        return rtn;
    }
}
