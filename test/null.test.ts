import { Kodo, MemoryProvider, NodeTranslator } from "../src";
import { Order, Payment, PaymentDetail, OrderOwner } from "./_modules";
import * as assert from "assert";

let kodo = new Kodo("my-test-net", {
    cache: false
});

describe("EQ Test", function () {
    before(function () {

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

        //1 owner
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
    });

    describe("Null Test", function () {
        it("1", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "payment",
                expression: {
                    $where: [{
                        $where: [
                            {
                                id: {
                                    $op: "==",
                                    $val: null
                                }
                            }
                        ]
                    }]
                }
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("2", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "payment",
                expression: {
                    $where: [{
                        $where: [
                            {
                                operator: {
                                    $op: "!=",
                                    $val: null
                                }
                            }
                        ]
                    }]
                }
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("3", () => {
            let nodes = kodo.explore<Payment>({
                $id: "startup",
                $ns: "payment",
                expression: {
                    $where: [{
                        $where: [
                            {
                                operator: {
                                    $op: "!=",
                                    $val: null
                                }
                            }
                        ]
                    }]
                }
            });

            assert.strictEqual(nodes.length, 0);
        });

        it("4", () => {
            let nodes = kodo.explore<Order>({
                $id: "startup",
                $ns: "order",
                expression: {
                    $where: [{
                        $with: "||",
                        $where: [
                            {
                                operator: {
                                    $op: "!=",
                                    $val: null
                                }
                            }
                        ]
                    }]
                }
            });

            assert.strictEqual(nodes.length, 8);
        });
    });
});