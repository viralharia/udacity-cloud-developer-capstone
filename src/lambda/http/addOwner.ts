import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createNewOwner } from '../../businesslogic/OwnerService'
import { Owner } from '../../models/Owner';
import { CreateUpdateOwnerRequest } from '../../requests/CreateUpdateOwnerRequest';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("processing createOwner event - "+JSON.stringify(event));

    const newOwner: CreateUpdateOwnerRequest = JSON.parse(event.body);

    let item:Owner = await createNewOwner(newOwner);
    
    return {
        statusCode: 201,
        body: JSON.stringify({
            item: item
        })
    }

})

handler.use(
    cors({
        credentials: true
    })
  )