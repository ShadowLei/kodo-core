import { LinkExpression, QueryExpression, QueryOnValue, convertLP2RO, revertLinkOperator } from "../expressions";
import { DataNode, LinkNode, QueryNode } from "../nodes";
import { generateHashCode } from "../utils";
import { INodeTranslator } from "./iNodeTranslator";

//DataNode + LinkNode => QueryNode
export class NodeTranslator implements INodeTranslator {
    private linkNodes: LinkNode<any, any>[];

    constructor() {
        this.linkNodes = [];
    }

    //always match for use.
    match<TFrom>(dn: DataNode<TFrom>): boolean {
        return true;
    }

    link<TFrom, TTo>(ln: LinkNode<TFrom, TTo>): boolean {
        if (!ln.$id) {
            let lnid = generateHashCode(ln);
            ln.$id = `ln-${ln.$fromNS}-${ln.$toNS}-${lnid}`;
        }
        this.linkNodes.push(ln);

        let revertLink = LinkNode.revert(ln);
        if (revertLink) { this.linkNodes.push(revertLink); }

        return true;
    }

    private tryMapOnData<TFrom, TTo>(rtnQE: QueryExpression<TTo>, where: LinkExpression<TFrom, TTo>, data: DataNode<TFrom>): boolean {
        let dataVal = data.data[where.$from];
        if (dataVal === undefined) { return false; }

        let rop = revertLinkOperator(where.$op);
        if (!rop) { return false; }

        rtnQE.$with = where.$with;

        rtnQE[where.$to] ||= {} as any;
        (rtnQE[where.$to] as QueryOnValue<TTo, keyof TTo>).$op = convertLP2RO(rop);
        (rtnQE[where.$to] as QueryOnValue<TTo, keyof TTo>).$val = dataVal as any; //TODO here: better strong type?
    }

    private tryMap<TFrom, TTo>(rtnQE: QueryExpression<TTo>, expression: LinkExpression<TFrom, TTo>, data: DataNode<TFrom>): void {
        rtnQE.$with = expression.$with;

        this.tryMapOnData(rtnQE, expression, data);

        if (expression.$where?.length > 0) {
            expression.$where.forEach(w => {
                let qeWhere: QueryExpression<TTo> = {};
                qeWhere.$with = w.$with;
                qeWhere.$where = [];
                this.tryMap(qeWhere, w, data);
                rtnQE.$where.push(qeWhere);
            });
        }
    }

    //DataNode + LinkNode => QueryNode
    translate<TFrom, TTo>(data: DataNode<TFrom>): QueryNode<TTo>[] {
        let rtn = [];

        this.linkNodes.forEach(ln => {
            if (ln.$fromNS !== data.$ns) { return; }

            let qn = new QueryNode<TTo>();
            qn.$id = `qn-${data.$ns}-${data.$id}-${ln.$id}`;
            qn.$ns = ln.$toNS;
            qn.$fromDN = data;
            qn.$fromLN = ln;
            qn.expression = {};
            qn.expression.$where = [];
            this.tryMap(qn.expression, ln.expression as LinkExpression<TFrom, TTo>, data);
            
            rtn.push(qn);
        });

        return rtn;
    }
}
