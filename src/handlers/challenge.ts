import db from "../database"
import {FastifyRequest, FastifyReply } from 'fastify'
import {buildErrorResponse , buildResponse} from "../uitl/buildReply"

import dayjs from 'dayjs'

interface params {
    accountId : number
}

export async function challenge(request : FastifyRequest<{Params : params}>,reply : FastifyReply){
    const account = await db.Accounts.findOneBy({ id : request.params.accountId })
    if(account == null){
        reply.code(400).send(buildErrorResponse(400, "not fount this account id"))
        return
    }

    const toDay = dayjs()
    const endOfMount = dayjs().endOf('month')
    const diffDay = endOfMount.diff(toDay,'day') + 1

    const message = `${account.name} have ${account.amount} in balance, just use no more than ${account.amount/diffDay} units/day unit end of mount`
    
    reply.code(200).send({
        message : message
    })

    


} 