
import { DataNode } from "../src";
import { expect } from 'bun:test';

function printNode(node: DataNode<any>) {
    console.log(`--======= ${node.$ns} | ${node?.$id} ===========--`);
    let n: DataNode<any> | undefined = node;
    console.log(JSON.stringify(n.data));
    
    let loopTime = 0;
    while (true) {

        console.log(`id: ${n.$id}`);
        console.log(`qnid: ${n.$fromQN[0]?.$id}`);
        console.log(`lnid: ${n.$fromQN[0]?.$fromLN?.$id || null}`);

        for (const from of n.$from) {
            console.log(`from: ${from.$id}`);
        }

        for (const to of n.$to) {
            console.log(`to: ${to.$id}`);
        }

        // n = n.$fromQN[0]?.$fromDN;
        // console.log(n.$from.length);
        // console.log(n.$fromQN.length);
        n = n.$from[0];
        console.log();

        if (!n) { break; }
        console.log(`--From:--`);

        //avoid dead-loop
        loopTime++;
        if (loopTime >= 10) { break; }
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
            strictEqual(n?.$fromQN[0]?.$id, qnid);
            strictEqual(!n?.$fromQN[0]?.$fromDN, true);
            strictEqual(!n?.$fromQN[0]?.$fromLN, true);
        }

        n = n?.$fromQN[0]?.$fromDN;
    }

    strictEqual(!n, true);
}