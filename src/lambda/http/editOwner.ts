import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { updateOwner } from '../../businesslogic/OwnerService'
import { Owner } from '../../models/Owner';
import { CreateUpdateOwnerRequest } from '../../requests/CreateUpdateOwnerRequest';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("processing editOwner event - "+JSON.stringify(event));

    const ownerId = event.pathParameters.ownerId;

    const owner: CreateUpdateOwnerRequest = JSON.parse(event.body);

    let item:Owner = await updateOwner(ownerId,owner);
    
    return {
        statusCode: 200,
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