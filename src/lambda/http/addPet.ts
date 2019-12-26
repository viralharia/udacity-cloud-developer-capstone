import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { addNewPet } from '../../businesslogic/PetService'
import { Pet } from '../../models/Pet';
import { CreateUpdatePetRequest } from '../../requests/CreateUpdatePetRequest';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("processing addPet event - "+JSON.stringify(event));

    const newPet: CreateUpdatePetRequest = JSON.parse(event.body);
    const ownerId = event.pathParameters.ownerId;

    let item:Pet = await addNewPet(ownerId,newPet);
    
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