import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import {getAllVetsInfo} from '../../businesslogic/VetService'
import { VetDTO } from '../../models/VetDTO';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("processing getAllVets event - "+JSON.stringify(event));
    let items:VetDTO[] = await getAllVetsInfo();
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            items: items
        })
    }

})

handler.use(
    cors({
        credentials: true
    })
  )