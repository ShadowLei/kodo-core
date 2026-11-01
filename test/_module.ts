import { mc, mp } from "meta-mapper";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, PrimaryColumn } from "typeorm";
import { UpdateDateColumn } from "typeorm/browser";
import { IKodoID } from "../src";

@Entity("order")
@mc("order")
export class Order implements IKodoID {
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

    get $id() {
        return this.id;
    }
}


@Entity("payment")
@mc("payment")
export class Payment implements IKodoID {
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

    get $id() {
        return this.id;
    }
}

@Entity("payment-detail")
@mc("payment-detail")
export class PaymentDetail implements IKodoID {

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

    get $id() {
        return this.id;
    }
}


@Entity("owner")
@mc("owner")
export class OrderOwner implements IKodoID {
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
    ts?: Date;

    get $id() {
        return this.id;
    }
}
