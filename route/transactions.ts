import { FastifyInstance } from "fastify"
import { getAllTransactions, createTransaction, editTransaction, deleteTransaction, attachTransactionSlips,getTransaction } from "../handlers/transaction"
import { summary } from "../handlers/summary"

const bodyJsonTransaction = {
    type: "object",
    properties : {
        "accountId" : { type :"integer" },
        "typeId" : { type :"integer"},
        "note" : { type :"string"},
        "amount" : { type :"number"},
    },
    required : ["accountId", "typeId", "note", "amount"],
    additionalProperties : false
}

const queryStringPagination = {
    type: 'object',
    properties: {
      page: { type: "integer", minimum : 1 },
      pagination: { type: "integer" , enum: [10, 20, 50,100]},
      types : { type : "string", pattern : "[0-9]+|\,", nullable : true},
      accounts : {type : "string", pattern : "[0-9]+|\,", nullable : true},
      start: {type: "string", format: "date-time", nullable : true},
      end :{type : "string", format : "date-time", nullable : true}
    },

    required : ["page" , "pagination"],
    additionalProperties : false
}

const queryStringSummery = {
    type: 'object',
    properties: {
      types : { type : "string", pattern : "[0-9]+|\,", nullable : true},
      accounts : {type : "string", pattern : "[0-9]+|\,", nullable : true},
      start: {type: "string", format: "date-time", nullable : true},
      end :{type : "string", format : "date-time", nullable : true}
    },

    required : [],
    additionalProperties : false
}

export function route(instance : FastifyInstance){
    instance.get("/api/transactions", { schema : { querystring : queryStringPagination } }, getAllTransactions)
    instance.post("/api/transactions", {schema : { body : bodyJsonTransaction}}, createTransaction)
    instance.get("/api/transactions/:transactionId", {}, getTransaction)
    instance.patch("/api/transactions/:transactionId", {schema : { body : bodyJsonTransaction}}, editTransaction)
    instance.delete("/api/transactions/:transactionId", {}, deleteTransaction)

    // add summary transactions
    instance.get("/api/summary", { schema : { querystring : queryStringSummery } }, summary)

    // add path slips to transaction
    instance.post("/upload/transactions/:transactionId/slips", {} , attachTransactionSlips)

}