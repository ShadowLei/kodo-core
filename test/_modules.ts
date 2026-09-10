import { mc, mp } from "meta-mapper";

@mc("order")
export class Order {
    @mp
    id: string;

    @mp
    logid: string;

    @mp
    operator?: string;
}

@mc("payment")
export class Payment {
    @mp
    id: string;

    @mp
    orderid: string;

    @mp
    amount: number;

    @mp
    operator?: string;
}

@mc("payment-detail")
export class PaymentDetail {
    @mp
    id: string;
    
    @mp
    paymentid: string;
    
    @mp
    amount: number;

    @mp
    desc?: string;
}

@mc("owner")
export class OrderOwner {
    @mp
    id: string;
    
    @mp
    orderid: string;

    @mp
    name?: string;
}
