
// export declare type LinkOperator = ">=" | ">" | "<" | "<=" | "==" | "!=" | "->";
export declare type LinkOperator = "==" | "->";
export declare type ROperator_Atom = ">=" | ">" | "<" | "<=" | "==" | "===" | "!=" | "!==";
export declare type ROperator_Array = "IN" | "!IN";
export declare type ROperator = ROperator_Atom | ROperator_Array;
export declare type BOperator = "&&" | "||";

export declare type Constructor<T> = new (...args: any[]) => T;

export declare type NodeNamespace<T> = Constructor<T> | string;

export interface IKodoID {
    get $id(): string;
}
