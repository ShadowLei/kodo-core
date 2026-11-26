import { Environment } from "@marcbachmann/cel-js";
import { DataNode } from "../nodes";
import { wrap } from "../utils";

// 名称	类型	说明	示例
// all	宏	判断列表中是否所有元素都满足谓词（对应 every）	[1,2,3].all(x, x > 0) → true
// exists	宏	判断列表中是否存在满足谓词的元素（对应 some）	[1,2,3].exists(x, x > 2) → true
// exists_one	宏	判断列表中是否恰好有一个元素满足谓词	[1,2,2].exists_one(x, x < 2) → true
// filter	宏	返回满足谓词的元素组成的新列表	[1,2,3].filter(x, x > 1) → [2, 3]
// map	宏	对每个元素应用变换，返回新列表（支持三参数和四参数形式）	[1,2,3].map(x, x * 2) → [2, 4, 6]
// size()	方法	返回列表长度	[1,2,3].size() → 3
// contains()	方法	判断列表是否包含某元素	[1,2,3].contains(2) → true
// in	运算符	判断元素是否在列表中	2 in [1,2,3] → true
const celEnv = new Environment({ unlistedVariablesAreDyn: true})
    .registerFunction('sum(list<double>): double', (list) => {
        return list.reduce((acc, val) => acc + Number(val || 0), 0);
    })
    .registerFunction('sort(dyn): list<dyn>', (list) => {
        if (!Array.isArray(list)) { return list; }
        return list.sort();
    })
    .registerFunction('join(dyn): string', (list, separator) => {
        if (!Array.isArray(list)) return list;
        return list.join(separator);
    })
    .registerFunction('flat(dyn): dyn', (list) => {
        if (!Array.isArray(list)) return list;
        return list.flat(1);
    })

export class Celer {
    private customExp(exp: string): string {
        // 将 .$id 或 .$ns 这类写法转换为 ["$id"] / ["$ns"]
        return exp.replace(/\.\$(\w+)/g, '["$$$1"]');
    }

    constructor(private nodes: DataNode<any>[], private opt?: {
        celWrap?: boolean
    }) {
        this.opt = Object.assign({ celWrap: true }, this.opt);
    }

    private refact2Boolean(obj: any): boolean {
        if (obj === true || obj === false) { return obj; }
        if (Array.isArray(obj)) {
            return (obj.length > 0);
        }

        return !!obj;
    }

    evaluate(exp: string): boolean {
        let wrapedNodes = this.opt?.celWrap ? wrap(this.nodes) : this.nodes;
        let exper = this.customExp(exp);
        let rtn = celEnv.evaluate(exper, { nodes: wrapedNodes });
        return this.refact2Boolean(rtn);
    }
}