import dotenv from 'dotenv';
dotenv.config();

import fastify, { FastifyRequest, FastifyReply } from 'fastify'
import { fastifyBasicAuth} from "@fastify/basic-auth"
import fastifyStatic from "@fastify/static"
import multipart from '@fastify/multipart'
import { ajv } from './uitl/ajv';


import routes from "./route"
import path from 'path';


async function server() {
  const server = fastify({
    logger: false
  })



  // set plugin upload files
  server.register(multipart)

  // set root 
  server.register(fastifyStatic , {
    root : path.join(__dirname , "../uploads"),
    prefix : "/files/"
  })

  // get schema validator
  server.setValidatorCompiler(({ schema, method, url, httpPart }) => {
    return ajv.compile(schema)
  })

  // login system
  if(process.env.APP_USERNAME == undefined || process.env.APP_PASSWORD == undefined){
    throw new Error(`set config Username , Password in .ENV file\n
      process.env.APP_USERNAME == undefined(${process.env.APP_USERNAME == undefined})
      process.env.APP_PASSWORD == undefined(${process.env.APP_PASSWORD == undefined})
      `)
  }
  async function validate (username : string, password : string, req : FastifyRequest , reply : FastifyReply) {
    if (username !== process.env.APP_USERNAME || password !== process.env.APP_PASSWORD) {
      return new Error('Winter is coming')
    }
  }
  await server.register(fastifyBasicAuth, { validate, authenticate : true})
  server.addHook('onRequest', server.basicAuth)

  for(let i = 0; i < routes.length ; i++){
    routes[i].route(server)
  }
  console.log('register route success')

  server.listen({ port: Number(process.env.PORT ?? "3000") }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })

}

server()
