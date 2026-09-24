
import { Order, Payment, PaymentDetail, OrderOwner } from "../_module";
import { DataNode, Kodo, MemoryProvider, MetaNodeTranslator, NodeTranslator } from "../../src";
import { DataSource } from "typeorm";
import { TypeOrmProvider } from "../../src/providers/typeOrmProvider";

function constructTypeOrm(): TypeOrmProvider {
    let ds: DataSource = new DataSource({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "kodo",
        password: "abc!@#123",
        database: "kodo_test",
        synchronize: false,
        logging: true,
        entities: [Order, Payment, PaymentDetail, OrderOwner],
        subscribers: [],
    });
    let mp = new TypeOrmProvider(ds);
    return mp;
}

export function initKodoTestData(kodo: Kodo) {
    //0. prepare test data in memory
    let mp = constructTypeOrm();

    let translator = new NodeTranslator();
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
    let mp = constructTypeOrm();

    let translator = new NodeTranslator();
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