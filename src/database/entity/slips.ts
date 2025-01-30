import { Entity, PrimaryGeneratedColumn,Column ,CreateDateColumn, DeleteDateColumn ,Index, ManyToOne } from "typeorm"

import { Transactions } from "./transactions"


@Entity()
export class Slips {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        unique : true,
    })
    file! : string

    @ManyToOne(() => Transactions, (transaction) => transaction.slips)
    transaction! : Transactions

    @CreateDateColumn()
    created_at!: Date;

    @DeleteDateColumn()
    deleted_at!: Date;
}