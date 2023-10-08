
import * as assert from "assert";
import { Order, Payment, PaymentDetail, OrderOwner } from "./_modules";
import { DataNode, Kodo, MemoryProvider, NodeTranslator } from "../src";

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

export function initKodoTestData(kodo: Kodo) {
        //0. prepare test data in memory
        let mp = new MemoryProvider();

        //4 orders
        mp.add<Order>("order", {
            id: "o1",
            logid: "111",
        });
        mp.add<Order>("order", {
            id: "o2",
            logid: "shadow"
        });
        mp.add<Order>("order", {
            id: "o3",
            logid: "P12345",    //target test order
            operator: "Shadow"
        });
        mp.add<Order>("order", {
            id: "o4",
            logid: "P12345",
            operator: "Allen"
        });

        //6 payments
        mp.add<Payment>("payment", {
            id: "p1-1",
            orderid: "o1",
            amount: 500
        });
        mp.add<Payment>("payment", {
            id: "p3-1",
            orderid: "o3",
            amount: 1300
        });
        mp.add<Payment>("payment", {
            id: "p3-2",
            orderid: "o3",
            amount: 2500
        });
        mp.add<Payment>("payment", {
            id: "p4-1",
            orderid: "o4",
            amount: 1100
        });
        mp.add<Payment>("payment", {
            id: "px-1",
            orderid: "xxx",
            amount: 5600
        });
        mp.add<Payment>("payment", {
            id: "px-2",
            orderid: "xxx",
            amount: 9000
        });

        //owner
        mp.add<OrderOwner>("owner", {
            id: "oo3-1",
            orderid: "o3",
            name: "LPSV0001"
        });

        //2 details
        mp.add<PaymentDetail>("payment-detail", {
            id: "pd3-1",
            paymentid: "p3-1",
            amount: 2400,
            desc: "shaodw - payment on 2023"
        });

        mp.add<PaymentDetail>("payment-detail", {
            id: "pd3-2",
            paymentid: "p3-2",
            amount: 2800,
            desc: "shaodw - payment on 2024"
        });

        let translator = new NodeTranslator();
        translator.link<Order, Payment>({
            $ns: "order-payment",
            $fromNS: "order",
            $toNS: "payment",
            expression: {
                $from: "id",
                $op: "==",
                $to: "orderid",
                $where: []
            }
        });
        translator.link<Order, OrderOwner>({
            $ns: "order-owner",
            $fromNS: "order",
            $toNS: "owner",
            expression: {
                $from: "id",
                $op: "==",
                $to: "orderid",
                $where: []
            }
        });
        translator.link<Payment, PaymentDetail>({
            $ns: "payment-detail",
            $fromNS: "payment",
            $toNS: "payment-detail",
            expression: {
                $from: "id",
                $op: "==",
                $to: "paymentid",
                $where: []
            }
        });

        kodo.registerTranslator(translator);
        kodo.registerProvider(mp);
}


export function initKodoTestExpressionData(kodo: Kodo) {
    //0. prepare test data in memory
    let mp = new MemoryProvider();

    //4 orders
    mp.add<Order>("order", {
        id: "o1",
        logid: "111",
    });
    mp.add<Order>("order", {
        id: "o2",
        logid: "shadow"
    });
    mp.add<Order>("order", {
        id: "o3",
        logid: "P12345",    //target test order
        operator: "Shadow"
    });
    mp.add<Order>("order", {
        id: "o4",
        logid: "P12345",
        operator: "Allen"
    });

    //6 payments
    mp.add<Payment>("payment", {
        id: "p1-1",
        orderid: "o1",
        amount: 500
    });
    mp.add<Payment>("payment", {
        id: "p3-1",
        orderid: "o3",
        amount: 1300
    });
    mp.add<Payment>("payment", {
        id: "p3-2",
        orderid: "o3",
        amount: 2500
    });
    mp.add<Payment>("payment", {
        id: "p4-1",
        orderid: "o4",
        amount: 1100
    });
    mp.add<Payment>("payment", {
        id: "px-1",
        orderid: "xxx",
        amount: 5600
    });
    mp.add<Payment>("payment", {
        id: "px-2",
        orderid: "xxx",
        amount: 9000
    });

    //owner
    mp.add<OrderOwner>("owner", {
        id: "oo3-1",
        orderid: "o3",
        name: "LPSV0001"
    });

    //2 details
    mp.add<PaymentDetail>("payment-detail", {
        id: "pd3-1",
        paymentid: "p3-1",
        amount: 2400,
        desc: "shaodw - payment on 2023"
    });

    mp.add<PaymentDetail>("payment-detail", {
        id: "pd3-2",
        paymentid: "p3-2",
        amount: 2800,
        desc: "shaodw - payment on 2024"
    });

    let translator = new NodeTranslator();
    translator.link<Order, Payment>({
        $ns: "order-payment",
        $fromNS: "order",
        $toNS: "payment",
        expression: //(m, p) => m.id == p.orderid
        {
            $from: "id",
            $op: "==",
            $to: "orderid",
            $where: []
        }
    });
    translator.link<Order, OrderOwner>({
        $ns: "order-owner",
        $fromNS: "order",
        $toNS: "owner",
        expression: {
            $from: "id",
            $op: "==",
            $to: "orderid",
            $where: []
        }
    });
    translator.link<Payment, PaymentDetail>({
        $ns: "payment-detail",
        $fromNS: "payment",
        $toNS: "payment-detail",
        expression: {
            $from: "id",
            $op: "==",
            $to: "paymentid",
            $where: []
        }
    });

    kodo.registerTranslator(translator);
    kodo.registerProvider(mp);
}