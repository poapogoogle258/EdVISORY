import { DataSource } from "typeorm"

import { Accounts } from "./entity/accounts"
import { Transactions } from "./entity/transactions"
import { Types } from "./entity/types"
import { Slips } from "./entity/slips"

if(process.env.DB_HOST == undefined || process.env.DB_PORT == undefined || process.env.DB_USERNAME == undefined || process.env.DB_PASSWORD == undefined || process.env.DB_NAME == undefined){
    throw new Error(`set config database in .ENV file\n
        process.env.DB_HOST == undefined(${process.env.DB_HOST == undefined})
        process.env.DB_PORT == undefined(${process.env.DB_PORT == undefined})
        process.env.DB_USERNAME == undefined(${process.env.DB_USERNAME == undefined})
        process.env.DB_PASSWORD == undefined(${process.env.DB_PASSWORD == undefined})
        process.env.DB_NAME == undefined(${process.env.DB_NAME == undefined})
        `)
}

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [ Accounts, Transactions, Types, Slips ],
    subscribers: [],
    migrations: [],
})
