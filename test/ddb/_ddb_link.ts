
import { Order, Payment, PaymentDetail, OrderOwner } from "../_module";
import { Kodo, NodeTranslator } from "../../src";
import { DDBProvider, DDBTableMap } from "../../src/providers/ddbProvider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Tables are keyed by the kodo namespace (the entity class name). The partition
// keys are chosen so the link expressions below map directly onto them:
//   Order.id            -> Payment.orderid   (Payment.pk)
//   Order.id            -> OrderOwner.orderid (OrderOwner.pk)
//   Payment.id          -> PaymentDetail.paymentid (PaymentDetail.pk)
const tables: DDBTableMap = {
    Order: { tableName: "Order", pk: "id" },
    Payment: { tableName: "Payment", pk: "orderid", sk: "id" },
    PaymentDetail: { tableName: "PaymentDetail", pk: "paymentid", sk: "id" },
    OrderOwner: { tableName: "OrderOwner", pk: "orderid", sk: "id" },
};

export function getClient(): DynamoDBDocumentClient {
    const client = new DynamoDBClient({
        region: process.env.AWS_REGION || "cn-northwest-1",
    });
    return DynamoDBDocumentClient.from(client);
}

export function initKodoTestData(kodo: Kodo) {
    const provider = new DDBProvider(getClient(), tables);

    const translator = new NodeTranslator();
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
    kodo.registerProvider("*", provider);
}
