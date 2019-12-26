import { DocumentClient, ItemList} from 'aws-sdk/clients/dynamodb'

import { VetDTO } from '../models/VetDTO';

const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const VET_SORT_KEY:string = "VET";
const VET_SPECIALTY_SORT_KEY:string = "VET_SPECIALTY";

export class VetDataAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly petClinicTable = process.env.PETCLINIC_TABLE,
    private readonly petClinicGSI = process.env.PETCLINIC_TABLE_GLOBAL_INDEX_NAME) {
  }

  async getAllVetsInfo(): Promise<VetDTO[]>{
    console.log('in VetDataAccess - getAllVetsInfo...');

    const result = await this.docClient.query({
      TableName: this.petClinicTable,
      IndexName: this.petClinicGSI,
      KeyConditionExpression: 'sort_key = :key_value',
      ExpressionAttributeValues: {
        ':key_value': VET_SORT_KEY
      }  
    }).promise()

    const vetsResult:ItemList = result.Items

    console.log("vetsResult - "+JSON.stringify(vetsResult));
    console.log("length - "+vetsResult.length);

    let vets:VetDTO[] = vetsResult.map(mapVetsDTOfromDBObject);

    let vet:VetDTO
    for(vet of vets){
        const vetsSpecialties = await this.docClient.query({
            TableName: this.petClinicTable,
            KeyConditionExpression: 'parition_key = :vet_id',
            ExpressionAttributeValues: {
                ':vet_id': vet.vetId
            }      
        }).promise();

        const vetsSpecialtiesResult = vetsSpecialties.Items.filter(item => item.sort_key != 'VET');
        console.log("vetsSpecialtiesResult - "+JSON.stringify(vetsSpecialtiesResult));
        let vetSpecialty;
        for(vetSpecialty of vetsSpecialtiesResult){
            vet.specialties.push(vetSpecialty.sort_key);
        }
    }

    return vets;
  }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new AWS.DynamoDB.DocumentClient()
  }

  function mapVetsDTOfromDBObject(item: any): VetDTO{
    var vetDTO:VetDTO = {
        vetId: item.parition_key as string,
        firstName: item.firstName as string,
        lastName: item.data as string,
        specialties: []
    }; 

    return vetDTO;
}