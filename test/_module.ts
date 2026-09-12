import { mc, mp } from "meta-mapper";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, PrimaryColumn } from "typeorm";
import { UpdateDateColumn } from "typeorm/browser";

@Entity("order")
@mc("order")
export class Order {
    @PrimaryColumn()
    @mp
    id: string;

    @Column()
    @mp
    logid: string;

    @Column()
    @mp
    operator?: string;

    @UpdateDateColumn()
    ts?: Date;
}


@Entity("payment")
@mc("payment")
export class Payment {
    @PrimaryColumn()
    @mp
    id: string;

    @Column()
    @mp
    orderid: string;

    @Column()
    @mp
    amount: number;

    @Column()
    @mp
    operator?: string;

    @UpdateDateColumn()
    ts?: Date;
}

@Entity("payment-detail")
@mc("payment-detail")
export class PaymentDetail {

    @PrimaryColumn()
    @mp
    id: string;
    
    @Column()
    @mp
    paymentid: string;
    
    @Column()
    @mp
    amount: number;

    @Column()
    @mp
    desc?: string;

    @UpdateDateColumn()
    ts?: Date;
}


@Entity("owner")
@mc("owner")
export class OrderOwner {
    @PrimaryColumn()
    @mp
    id: string;
    
    @Column()
    @mp
    orderid: string;

    @Column()
    @mp
    name?: string;

    @UpdateDateColumn()
    ts?: Date
}
