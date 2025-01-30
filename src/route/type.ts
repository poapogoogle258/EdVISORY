import { FastifyInstance } from "fastify"
import {getTypes,createType,updateType,deleteType} from "../handlers/types"

const bodyJsonType = {
    type: "object",
    properties : {
        "name" : { type :"string" },
        "description" : { type :"string"},
    },
    required : ["name", "description"],
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
    instance.get("/api/types", { schema : { querystring : queryStringPagination } }, getTypes)
    instance.post("/api/types", {schema : { body : bodyJsonType }}, createType)
    instance.patch("/api/types/:typeId", {schema : { body : bodyJsonType }}, updateType)
    instance.delete("/api/types/:typeId", {}, deleteType)
}