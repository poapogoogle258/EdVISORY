import { Entity, PrimaryGeneratedColumn,Column , DeleteDateColumn, OneToMany  } from "typeorm"
import { Transactions } from "./transactions"

@Entity()
export class Types {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name! : string

    @Column()
    description!: string

    @OneToMany(() => Transactions , (transaction) => transaction.type)
    transactions! : Transactions[]

    @DeleteDateColumn()
    deleted_at!: Date;
}