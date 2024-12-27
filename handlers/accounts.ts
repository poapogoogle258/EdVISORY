import db from "../database"
import {FastifyRequest, FastifyReply } from 'fastify'
import {buildErrorResponse , buildResponse} from "../uitl/buildReply"

interface AccountRequest {
    name? : string
    description? : string
}

interface queryString {
    page : number,
    pagination : number
}

interface params {
    accountId : number
}

export async function getAccount(request : FastifyRequest<{ Querystring : queryString }>, reply : FastifyReply) {
    const types = await db.Accounts
    .createQueryBuilder()
    .skip((request.query.page - 1) * request.query.pagination)
    .take(request.query.pagination)
    .getMany()

    reply.code(200).send(buildResponse(200, types))
}

export async function createAccount(request : FastifyRequest<{Body: AccountRequest}>,reply : FastifyReply) {
    const newAccount = db.Accounts.create(request.body)

    try {
        await db.Accounts.save(newAccount)
        reply.code(200).send(buildResponse(200, newAccount))
    } catch (error) {
        reply.code(500).send(buildErrorResponse(500, error))
    }
}

export async function updateAccount(request : FastifyRequest<{Body: AccountRequest, Params:params }>, reply : FastifyReply) {
    const accountId = request.params.accountId
    const account = await db.Accounts.findOneBy({ id : accountId })
    if(account == null){
        reply.code(400).send(buildErrorResponse(400, "account id not fount"))
        return
    }

    account.name = request.body.name ?? account.name
    account.description = request.body.description ?? account.description

    try{
        await db.Accounts.save(account)
        reply.code(200).send(buildResponse(200, account))
    }catch(error){
        reply.code(500).send(buildErrorResponse(500, error))
    }
    
}

export async function deleteAccount(request : FastifyRequest<{Params:params}>, reply : FastifyReply) {
    const accountId = request.params.accountId
    const account = await db.Accounts.findOneBy({ id : accountId })
    if(account == null){
        reply.code(400).send(buildErrorResponse(400, "account id not fount"))
        return
    }

    try{
        await db.Accounts
            .createQueryBuilder()
            .softDelete()
            .where("id = :id", {id : accountId})
            .execute()

        reply.code(200).send(buildResponse(200, null))
    }catch(error){
        reply.code(500).send(buildErrorResponse(500, error))
    }
    
}