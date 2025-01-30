import { AppDataSource } from "./data-source"

import { Accounts } from "./entity/accounts"
import { Transactions } from "./entity/transactions"
import { Types } from "./entity/types"
import { Slips } from "./entity/slips"


(async() => {
  try {
    console.log('start database')
    await AppDataSource.initialize()
    console.log("Data Source has been initialized successfully.")
  } catch (error) {
    console.error("Error during Data Source initialization:", error)
  }
})()

export default {
  "Accounts" : AppDataSource.getRepository(Accounts),
  "Transactions" : AppDataSource.getRepository(Transactions),
  "Types" : AppDataSource.getRepository(Types),
  "Slips" : AppDataSource.getRepository(Slips),
}