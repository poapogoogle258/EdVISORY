import { Entity, PrimaryGeneratedColumn,Column ,CreateDateColumn, DeleteDateColumn ,ManyToOne, OneToOne, JoinColumn, OneToMany } from "typeorm"

import { Accounts } from "./accounts"
import { Types } from "./types"
import { Slips } from "./slips"

@Entity()
export class Transactions {
    @PrimaryGeneratedColumn()
    id!: number

    @Column('double',{
        default : 0
    })
    amount!: number

    @Column()
    note! : string

    @ManyToOne(() => Accounts, (account) => account.statements, { nullable : false})
    account!: Accounts

    @ManyToOne(() => Types,(_type) => _type.transactions ,{ nullable : false})
    type!: Types

    @OneToMany(() => Slips, (slip) => slip.transaction, { nullable : false})
    slips!: Slips[]

    @CreateDateColumn()
    created_at!: Date;

    @DeleteDateColumn()
    deleted_at!: Date;
}