import { MetaUtil } from "meta-mapper";
import { Constructor, LinkExpression, LinkExpressionObject, NodeNamespace, QueryExpressionObject, QueryOnValue, convertLP2RO, revertLinkOperator } from "../expressions";
import { DataNode, LinkNode, QueryNode } from "../nodes";
import { generateHashCode } from "../utils";
import { LinkNodeUtil } from "../utils/linkNodeUtil";
import { INodeTranslator } from "./iNodeTranslator";

//DataNode + LinkNode => QueryNode
export class MetaNodeTranslator implements INodeTranslator {
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

    link<TFrom, TTo>(ln: LinkNode<TFrom, TTo>): boolean {
        if (!ln.$id) {
            let lnid = generateHashCode(ln);
            ln.$id = `ln-${this.getNsName(ln.$from)}-${this.getNsName(ln.$to)}-${lnid}`;
        }
        this.linkNodes.push(ln);

        let revertLink = LinkNodeUtil.revert(ln);
        if (revertLink) { this.linkNodes.push(revertLink); }

        return true;
    }

    private tryMapOnData<TFrom, TTo>(rtnQE: QueryExpressionObject<TTo>, where: LinkExpressionObject<TFrom, TTo>, data: DataNode<TFrom>): void {
        let dataVal = data.data[where.$from];
        if (dataVal === undefined) { return; }

        let rop = revertLinkOperator(where.$op);
        if (!rop) { return; }

        rtnQE.$with = where.$with;

        rtnQE[where.$to] ||= {} as any;
        (rtnQE[where.$to] as QueryOnValue<TTo, keyof TTo>).$op = convertLP2RO(rop);
        (rtnQE[where.$to] as QueryOnValue<TTo, keyof TTo>).$val = dataVal as any;
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

    private getNsName<T>(ns: NodeNamespace<T>): string {
        if (typeof ns === "function") {
            let type = ns as Constructor<T>;
            let mc = MetaUtil.tryGetMC(type);
            return (mc ? mc.name : type.name);
        } else {
            return ns;
        }
    }

    //DataNode + LinkNode => QueryNode
    translate<TFrom, TTo>(data: DataNode<TFrom>): QueryNode<TTo>[] {
        let rtn = [];

        let fromNodes = this.linkNodes.filter(m => this.getNsName(m.$from) === data.$ns);

        fromNodes.forEach(ln => {
            let qn = new QueryNode<TTo>();
            qn.$id = `qn-${data.$ns}-${data.$id}-${ln.$id}`;
            qn.$ns = this.getNsName(ln.$to);
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
            
            rtn.push(qn);
        });

        return rtn;
    }
}
