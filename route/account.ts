import { FastifyInstance } from "fastify"

import { getAccount, createAccount, updateAccount, deleteAccount } from "../handlers/accounts"

import { challenge } from "../handlers/challenge"

const bodyJsonAccount = {
    type: "object",
    properties : {
        "name" : { type :"string" },
        "description" : { type :"string"},
    },
    required : [],
    additionalProperties : false
}

const queryStringPagination = {
    type: 'object',
    properties: {
      page: { type: "integer", minimum : 1 },
      pagination: { type: "integer" , enum: [10, 20, 50,100]}
    },

    required : ["page" , "pagination" ],
    additionalProperties : false
}

export function route(instance : FastifyInstance){
    instance.get("/api/accounts", { schema : { querystring : queryStringPagination } }, getAccount)
    instance.post("/api/accounts", {schema : { body : bodyJsonAccount }}, createAccount)
    instance.patch("/api/accounts/:accountId", {schema : { body : bodyJsonAccount }}, updateAccount)
    instance.delete("/api/accounts/:accountId", {}, deleteAccount)

    instance.get("/challenge/accounts/:accountId", {}, challenge )
}