import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import {getAllOwners} from '../../businesslogic/OwnerService'
import { Owner } from '../../models/Owner';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("processing getAllOwners event - "+JSON.stringify(event));
    let items:Owner[] = await getAllOwners();
    
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