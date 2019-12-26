import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getOwnerInfo } from '../../businesslogic/OwnerService'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("processing getOwnerInfo event - "+JSON.stringify(event));

    const ownerId = event.pathParameters.ownerId;
    const item = await getOwnerInfo(ownerId);

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