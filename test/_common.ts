
import * as assert from "assert";
import { DataNode } from "../src";

function printNode(node: DataNode<any>) {
    console.log(`--======= ${node.$ns} | ${node?.$id} ===========--`);
    let n = node;
    while (true) {
        if (!n) { break; }

        console.log(`id: ${n.$id}`);
        console.log(`qnid: ${n.$fromQN?.$id}`);
        console.log(`lnid: ${n.$fromQN?.$fromLN?.$id || null}`);
        
        n = n.$fromQN?.$fromDN;

        console.log();
    }
}

export function printNodes(nodes: DataNode<any>[]) {
    console.log(`len: ${nodes.length}`);
    nodes.forEach(m => printNode(m));
}

export function verifyIds(node: DataNode<any>, ids: string[], qnid: string) {
    let n = node;
    for (let i = 0; i < ids.length; i++) {
        assert.strictEqual(n?.$id, ids[i]);

        if (i === ids.length - 1) {
            assert.strictEqual(n.$fromQN?.$id, qnid);
            assert.strictEqual(!n.$fromQN?.$fromDN, true);
            assert.strictEqual(!n.$fromQN?.$fromLN, true);
        }

        n = n.$fromQN?.$fromDN;
    }

    assert.strictEqual(!n, true);
}