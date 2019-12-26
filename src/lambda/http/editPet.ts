import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { editPet } from '../../businesslogic/PetService'
import { Pet } from '../../models/Pet';
import { CreateUpdatePetRequest } from '../../requests/CreateUpdatePetRequest';

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("processing editPet event - "+JSON.stringify(event));

    const petData: CreateUpdatePetRequest = JSON.parse(event.body);
    const ownerId = event.pathParameters.ownerId;
    const petId = event.pathParameters.petId;

    let item:Pet = await editPet(ownerId, petId, petData);
    
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