
export declare type LinkOperator = ">=" | ">" | "<" | "<=" | "==" | "!=" | "->";
export declare type ROperator_Atom = ">=" | ">" | "<" | "<=" | "==" | "===" | "!=" | "!==";
export declare type ROperator_Array = "IN" | "!IN";
export declare type ROperator = ROperator_Atom | ROperator_Array;
export declare type BOperator = "&&" | "||";

export function revertLinkOperator(op: LinkOperator): LinkOperator | null {
    switch(op) {
        case ">":
            return "<";
        case ">=":
            return "<=";
        case "<":
            return ">";
        case "<=":
            return ">=";
        case "->":  //single op
            return null;
        default:
            return op;
    }
}

export function convertLP2RO(op: LinkOperator): ROperator | null {
    switch (op) {
        case "->":  //single op
            return "==";
        default:
            return op;
    }
}