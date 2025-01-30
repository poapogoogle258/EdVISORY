import { Entity, PrimaryGeneratedColumn,Column ,CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from "typeorm"

import { Transactions } from "./transactions"

@Entity()
export class Accounts {
    @PrimaryGeneratedColumn()
    id! : number

    @Column()
    name! : string

    @Column()
    description!: string

    @Column('double',{
        default : 0
    })
    amount!: number

    @OneToMany(() => Transactions, (transaction) => transaction.account)
    statements !: Transactions[]

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @DeleteDateColumn()
    deleted_at!: Date;

}