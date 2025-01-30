import db from "../database"
import {FastifyRequest, FastifyReply } from 'fastify'
import {buildErrorResponse , buildResponse} from "../uitl/buildReply"

interface Type {
    name : string
    description : string
}

interface queryString {
    page : number,
    pagination : number
}

interface paramsType {
    typeId : number
}

export async function getTypes(request : FastifyRequest<{ Querystring : queryString }>, reply : FastifyReply) {
    const types = await db.Types
    .createQueryBuilder("Types")
    .skip((request.query.page - 1) * request.query.pagination)
    .take(request.query.pagination)
    .getMany()

    reply.code(200).send(buildResponse(200, types))
}

export async function createType(request : FastifyRequest<{Body: Type}>,reply : FastifyReply) {
    const newType = db.Types.create(request.body)

    try {
        await db.Types.save(newType)
        reply.code(200).send(buildResponse(200, newType))
    } catch (error) {
        reply.code(500).send(buildErrorResponse(500, error))
    }
}



export async function updateType(request : FastifyRequest<{Body: Type, Params:paramsType }>, reply : FastifyReply) {
    const typeId = request.params.typeId
    const type = await db.Types.findOneBy({ id : typeId })
    if(type == null){
        reply.code(400).send(buildErrorResponse(400, "type_id not fount"))
        return
    }

    type.name = request.body.name
    type.description = request.body.description

    try{
        await db.Types.save(type)
        reply.code(200).send(buildResponse(200, type))
    }catch(error){
        reply.code(500).send(buildErrorResponse(500, error))
    }
    
}

export async function deleteType(request : FastifyRequest<{Params:paramsType}>, reply : FastifyReply) {
    const typeId = request.params.typeId
    const type = await db.Types.findOneBy({ id : typeId })
    if(type == null){
        reply.code(400).send(buildErrorResponse(400, "type id not fount"))
        return
    }

    try{
        await db.Types
            .createQueryBuilder()
            .softDelete()
            .where("id = :id", {id : typeId})
            .execute()

        reply.code(200).send(buildResponse(200, null))
    }catch(error){
        reply.code(500).send(buildErrorResponse(500, error))
    }
    
}