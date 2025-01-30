import db from "../database"
import {FastifyRequest, FastifyReply } from 'fastify'
import {buildErrorResponse , buildResponse} from "../uitl/buildReply"

import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'

const pump = util.promisify(pipeline)

interface bodyTransaction {
    accountId : number
    typeId : number
    note : string
    amount : number
}

interface queryString {
    page : number,
    pagination : number
}

interface queryFilter extends queryString {
    types? : string
    accounts? : string,
    start? : Date
    end? :Date
}

interface params {
    transactionId : number
}


function antiSwear(text : string) : string {
    // TO DO : impalements
    const words = ["เลว", "ชั่ว", "ชาติหมา", "ควาย","ควย","เหี้ย", "ไอ่สัตร์", "แม่ง", "มึง", "กู", "ประยุทธ์"]
    
    return words.reduce((v , w, i) => v.replaceAll(w, "****") , text)

}

export async function getAllTransactions(request : FastifyRequest<{ Querystring : queryFilter }>, reply : FastifyReply) {

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


    const results = await transactions
        .skip((request.query.page - 1) * request.query.pagination)
        .take(request.query.pagination)
        .getMany()

    reply.code(200).send(buildResponse(200, results))

}

export async function createTransaction(request : FastifyRequest<{Body: bodyTransaction}>,reply : FastifyReply) {
    
    const transactionType = await db.Types.findOneBy({id : request.body.typeId })
    if(transactionType == null){
        reply.code(400).send(buildErrorResponse(400, "not fount type id"))
        return
    }

    const transactionAccount = await db.Accounts.findOneBy({ id : request.body.accountId})
    if(transactionAccount == null){
        reply.code(200).send(buildErrorResponse(400, "not fount account id"))
        return
    }

    request.body.note = antiSwear(request.body.note)

    const insect = {
        note : request.body.note,
        amount : request.body.amount,
        account : transactionAccount,
        type : transactionType,
    }
    const newTransaction = db.Transactions.create(insect)

    try {

        await db.Transactions.save(newTransaction)
        
        transactionAccount.amount = transactionAccount.amount + request.body.amount
        await db.Accounts.save(transactionAccount)

        reply.code(200).send(buildResponse(200, newTransaction))
    } catch (error) {
        reply.code(500).send(buildErrorResponse(500, error))
    }
}

export async function editTransaction(request : FastifyRequest<{Body: bodyTransaction, Params:params }>, reply : FastifyReply) {

    const transactionId = request.params.transactionId
    const transaction = await db.Transactions.findOneBy({ id : transactionId })
    if(transaction == null){
        reply.code(400).send(buildErrorResponse(400, "transaction id not fount"))
        return
    }

    const transactionType = await db.Types.findOneBy({id : request.body.typeId })
    if(transactionType == null){
        reply.code(400).send(buildErrorResponse(400, "not fount type id"))
        return
    }

    const transactionAccount = await db.Accounts.findOneBy({ id : request.body.accountId})
    if(transactionAccount == null){
        reply.code(200).send(buildErrorResponse(400, "not fount account id"))
        return
    }

    const difference = request.body.amount - transaction.amount

    transaction.amount = request.body.amount
    transaction.note = antiSwear(request.body.note)
    transaction.type = transactionType
    transaction.account = transactionAccount

    try{
        await db.Transactions.save(transaction)

        transactionAccount.amount = transactionAccount.amount + difference
        await db.Accounts.save(transactionAccount)

        reply.code(200).send(buildResponse(200, transaction))
    }catch(error){
        reply.code(500).send(buildErrorResponse(500, error))
    }
    
}

export async function deleteTransaction(request : FastifyRequest<{Params:params}>, reply : FastifyReply) {
    const transactionId = request.params.transactionId

    const transaction = await db.Transactions.findOne({ where :{ id : transactionId }, relations : ["account"]})
    if(transaction == null){
        reply.code(400).send(buildErrorResponse(400, "transaction id not fount"))
        return
    }

    const transactionAccount = await db.Accounts.findOneBy({ id : transaction.account.id })
    if(transactionAccount == null){
        reply.code(500).send(buildErrorResponse(500, "not fount account id in transaction"))
        return
    }

    try{
        await db.Transactions
            .createQueryBuilder()
            .softDelete()
            .where("id = :id", {id : transactionId})
            .execute()

        transactionAccount.amount = transactionAccount.amount - transaction.amount
        await db.Accounts.save(transactionAccount)

        reply.code(200).send(buildResponse(200, null))
    }catch(error){
        reply.code(500).send(buildErrorResponse(500, error))
    }
    
}

export async function getTransaction(request : FastifyRequest<{ Params : params}>, reply : FastifyReply){
    const transactionId = request.params.transactionId
    const transaction = await db.Transactions
        .createQueryBuilder('transaction')
        .innerJoinAndSelect('transaction.type', 'type')
        .innerJoinAndSelect('transaction.account', 'account')
        .innerJoinAndSelect('transaction.slips', 'slips')
        .where({ id : transactionId})
        .getOne()
    
    if(transaction == null){
        reply.code(400).send(buildErrorResponse(400, "not fount transaction id"))
        return
    }

    reply.code(200).send(buildResponse(200, transaction))

}

export async function attachTransactionSlips(request : FastifyRequest<{Params: params}>, reply : FastifyReply){
    const existsTransactionId = await db.Transactions.exists({where : { id : request.params.transactionId}})
    if(!existsTransactionId){
        reply.code(400).send(buildResponse(400 , "transaction id not fount"))
        return
    }

    const parts = request.files()
    const filenames : string[] = []
    const imageExtension = ['.jpg','.jpeg','.png']
    
    for await(const part of parts){

        if(!imageExtension.some((ex) => part.filename.indexOf(ex) != -1)){
            throw new Error("allow only image type '.jpg','.jpeg','.png' ")
        }

        const filename = `${request.params.transactionId}_${part.filename}`
        try{
            await pump(part.file, fs.createWriteStream(`./uploads/${filename}`))
            filenames.push(filename)
        }catch(error){
            for(const filename of filenames){
                fs.unlink(`./uploads/${filename}`, (err) => console.log(`unlink file ${filename} error : ${err}`))
            }
            reply.code(500).send(buildErrorResponse(500, error))
            return
        }
    }

    for(const filename of filenames){
        const slip = db.Slips.create({file : filename, transaction : { id : request.params.transactionId }})
        await db.Slips.save(slip)
    }

    reply.code(200).send(buildResponse(200, null))

}
