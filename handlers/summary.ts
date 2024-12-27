import db from "../database"
import {FastifyRequest, FastifyReply } from 'fastify'
import { buildResponse } from "../uitl/buildReply"

interface filterTransaction {
    types? : string,
    accounts? : string,
    start? : Date
    end? : Date
}


export async function summary(request : FastifyRequest<{Querystring : filterTransaction}>, reply : FastifyReply){
    let transactions = db.Transactions.createQueryBuilder("transaction")
        .leftJoinAndSelect('transaction.type', 'type')
        .leftJoinAndSelect('transaction.account', 'account')
    
    let isFirstWhere = true
    if(request.query.types != undefined && request.query.accounts != undefined){
        transactions = transactions.where('transaction.typeId IN (:...types)', {types : request.query.types.split(',') })
        transactions = transactions.andWhere('transaction.accountId IN (:...accounts)', {accounts : request.query.accounts.split(',')})
        isFirstWhere = false
    }
    else if(request.query.types != undefined){
        transactions = transactions.where('transaction.typeId IN (:...types)', {types : request.query.types.split(',') })
        isFirstWhere = false
    }
    else if(request.query.accounts != undefined){
        transactions = transactions.where('transaction.accountId IN (:...accounts)', {accounts : request.query.accounts.split(',')})
        isFirstWhere = false
    }
    
    if(request.query.start != undefined && request.query.end != undefined){
        const startDate = new Date(request.query.start)
        const endDate = new Date(request.query.end)

        transactions = (isFirstWhere) 
            ? transactions.where("transaction.created_at BETWEEN :start AND :end",{ start : startDate.toISOString() , end : endDate.toISOString() })
            : transactions.andWhere("transaction.created_at BETWEEN :start AND :end",{ start : startDate.toISOString() , end : endDate.toISOString() })
    }
    else if(request.query.start != undefined){
        const startDate = new Date(request.query.start)

        transactions = (isFirstWhere)
            ? transactions.where("transaction.created_at >= :start",{ start : startDate.toISOString() })
            : transactions.andWhere("transaction.created_at >= :start",{ start : startDate.toISOString() })
    }
    else if(request.query.end != undefined){
        const endDate = new Date(request.query.end)

        transactions = (isFirstWhere) 
            ? transactions.where("transaction.created_at <= :end",{ end : endDate.toISOString() })
            : transactions.andWhere("transaction.created_at <= :end",{ end : endDate.toISOString() })
    }
    else{
        // select all time
    }


    const data = await transactions.getMany()

    const summary = new Map<string, Map<string, number>>()
    /**
     *    [account_name] :
     *          [type_name] : amount
     *          [type_name] : amount
     *          [type_name] : amount
     *    [account_name] :
     *          [type_name] : amount
     *          ...
    */

    const test : object = {}

    for(let i = 0;i < data.length; i++){

        if(!summary.has(data[i].account.name)){
            summary.set(data[i].account.name, new Map<string, number>)
        }
        if(!summary.get(data[i].account.name)?.has(data[i].type.name)){
            summary.get(data[i].account.name)?.set(data[i].type.name, 0)
        }
        if(!summary.get(data[i].account.name)?.has("balance")){
            summary.get(data[i].account.name)?.set("balance", 0)
        }

        const value = summary.get(data[i].account.name)?.get(data[i].type.name) ?? 0
        const balance = summary.get(data[i].account.name)?.get("balance") ?? 0

        summary.get(data[i].account.name)?.set(data[i].type.name, value + data[i].amount)
        summary.get(data[i].account.name)?.set("balance", balance + data[i].amount )

    }

    reply.code(200).send(buildResponse(200, toJSON(summary)))
    
}

function toJSON(_data : Map<string, Map<string, number>>) : any {
    const data : any = Object.fromEntries(_data)
    for(const key in data){
        data[key] = Object.fromEntries(data[key])
    }

    return data
}