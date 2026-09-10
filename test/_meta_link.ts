
import { Order, Payment, PaymentDetail, OrderOwner } from "./_modules";
import { DataNode, Kodo, MemoryProvider, MetaNodeTranslator, NodeTranslator } from "../src";

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

    let translator = new MetaNodeTranslator();
    translator.link<Order, Payment>({
        $from: Order,
        $to: Payment,
        expression: {
            $from: "id",
            $op: "==",
            $to: "orderid",
            $where: []
        }
    });
    translator.link<Order, OrderOwner>({
        $from: Order,
        $to: OrderOwner,
        expression: {
            $from: "id",
            $op: "==",
            $to: "orderid",
            $where: []
        }
    });
    translator.link<Payment, PaymentDetail>({
        $from: Payment,
        $to: PaymentDetail,
        expression: {
            $from: "id",
            $op: "==",
            $to: "paymentid",
            $where: []
        }
    });

    kodo.registerTranslator(translator);
    kodo.registerProvider("*", mp);
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

    let translator = new MetaNodeTranslator();
    translator.link<Order, Payment>({
        $from: Order,
        $to: Payment,
        expression: //(m, p) => m.id == p.orderid
        {
            $from: "id",
            $op: "==",
            $to: "orderid",
            $where: []
        }
    });
    translator.link<Order, OrderOwner>({
        $from: Order,
        $to: OrderOwner,
        expression: {
            $from: "id",
            $op: "==",
            $to: "orderid",
            $where: []
        }
    });
    translator.link({
        $from: Payment,
        $to: PaymentDetail,
        expression: {
            $from: "id",
            $op: "==",
            $to: "paymentid",
            $where: []
        }
    });

    kodo.registerTranslator(translator);
    kodo.registerProvider("*", mp);
}