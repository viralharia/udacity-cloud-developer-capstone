import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { addNewVisit } from '../../businesslogic/PetService'
import { VisitInfo } from '../../models/VisitInfo';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("processing addVisit event - "+JSON.stringify(event));

    const newVisit: VisitInfo = JSON.parse(event.body);
    const ownerId = event.pathParameters.ownerId;
    const petId = event.pathParameters.petId;

    let item:VisitInfo = await addNewVisit(petId,newVisit);
    
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