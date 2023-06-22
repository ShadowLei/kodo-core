
export class Order {
    id: string;
    logid: string;

    operator?: string;
}

export class Payment {
    id: string;
    orderid: string;
    amount: number;

    operator?: string;
}

export class PaymentDetail {
    id: string;
    paymentid: string;
    amount: number;

    desc: string;
}

export class OrderOwner {
    id: string;
    orderid: string;

    name: string;
}
