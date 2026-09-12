
import { DataNode } from "../src";
import { expect } from 'bun:test';

function printNode(node: DataNode<any>) {
    console.log(`--======= ${node.$ns} | ${node?.$id} ===========--`);
    let n: DataNode<any> | undefined = node;
    console.log(JSON.stringify(n.data));
    
    while (true) {

        console.log(`id: ${n.$id}`);
        console.log(`qnid: ${n.$fromQN?.$id}`);
        console.log(`lnid: ${n.$fromQN?.$fromLN?.$id || null}`);

        n = n.$fromQN?.$fromDN;
        console.log();

        if (!n) { break; }
        console.log(`--From:--`);

    }
}

export function strictEqual(a1: any, a2: any): void {
    return expect(a1).toStrictEqual(a2);
}

export function printNodes(nodes: DataNode<any>[]) {
    console.log(`len: ${nodes.length}`);
    nodes.forEach(m => printNode(m));
}

export function verifyIds(node: DataNode<any> | undefined, ids: string[], qnid: string) {
    let n = node;
    for (let i = 0; i < ids.length; i++) {
        strictEqual(n?.$id, ids[i]);

        if (i === ids.length - 1) {
            strictEqual(n?.$fromQN?.$id, qnid);
            strictEqual(!n?.$fromQN?.$fromDN, true);
            strictEqual(!n?.$fromQN?.$fromLN, true);
        }

        n = n?.$fromQN?.$fromDN;
    }

    strictEqual(!n, true);
}