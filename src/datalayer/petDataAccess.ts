import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as uuid from 'uuid'
import { Pet } from '../models/Pet';
import { CreateUpdatePetRequest } from '../requests/CreateUpdatePetRequest';
import { VisitInfo } from '../models/VisitInfo';

const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const PET_SORT_KEY:string = "OWNER_PET";

export class PetDataAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly petClinicTable = process.env.PETCLINIC_TABLE,
    private readonly petClinicGSI = process.env.PETCLINIC_TABLE_GLOBAL_INDEX_NAME) {
  }

  async addNewPet(ownerId: string, petData: CreateUpdatePetRequest): Promise<Pet> {

    console.log("in PetDataAccess - addNewPet..."+ownerId);

    let petToSave = getDBObjectToSave(ownerId,petData);
    
    await this.docClient.put({
      TableName: this.petClinicTable,
      Item: petToSave,

    }).promise();    
    return mapPetObjectFromDBObject(petToSave);
  }

  async editPet(ownerId: string, petId: string, petData: CreateUpdatePetRequest):Promise<Pet>{
    console.log("in PetDataAccess - editPet...");
    const result =  await this.docClient.update({
      TableName: this.petClinicTable,
      Key:{
        "parition_key": petId,
        "sort_key": PET_SORT_KEY
      },
      UpdateExpression: 'SET #data = :ownerId, petName = :petName, #type = :type, dob = :dob',
      ExpressionAttributeValues: {
        ':ownerId': ownerId,
        ':petName': petData.petName,
        ':type': petData.type,
        ':dob': petData.dob
      },
      ExpressionAttributeNames: {
        "#data": "data",
        "#type": "type"
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    return mapPetObjectFromDBObject(result.Attributes);
  }

  async getAllPetsOfOwner(ownerId: string): Promise<Pet[]>{
    const pets = await this.docClient.query({
      TableName: this.petClinicTable,
      IndexName: this.petClinicGSI,
      KeyConditionExpression: 'sort_key = :sort_key_value and #data = :data_value',
      ExpressionAttributeValues: {
        ':sort_key_value': PET_SORT_KEY,
        ':data_value' : ownerId
      },
      ExpressionAttributeNames:{
        '#data': 'data'
      }
    }).promise();

    return pets.Items.map(mapPetObjectFromDBObject);
  }

  async getAllVisitsInfoOfPet(petId: string): Promise<VisitInfo[]>{
    console.log('in PetDataAccess - getAllVisitsInfoOfPet...'+petId);

    const result = await this.docClient.query({
      TableName: this.petClinicTable,
      KeyConditionExpression: 'parition_key = :key_value',
      ExpressionAttributeValues: {
        ':key_value': petId
      }  
    }).promise()

    const visitsResult:VisitInfo[] = result.Items.filter(item => item.sort_key != 'OWNER_PET').map(mapVisitObjectFromDB);

    return visitsResult;
  }

  async addNewVisit(petId: string, visitData:VisitInfo): Promise<VisitInfo>{
    console.log('in PetDataAccess - addNewVisit...'+petId);

    let visitToSave = getVisitDBObjectToSave(petId,visitData);
    
    await this.docClient.put({
      TableName: this.petClinicTable,
      Item: visitToSave,

    }).promise();    
    return mapVisitObjectFromDB(visitToSave);
  }

  /* async getAllPetsOwnersInfo(): Promise<Owner[]> {
    console.log('in OwnerDataAccess - getAllPetsOwnersInfo...');

    const result = await this.docClient.query({
      TableName: this.petClinicTable,
      IndexName: this.petClinicGSI,
      KeyConditionExpression: 'sort_key = :key_value',
      ExpressionAttributeValues: {
        ':key_value': "OWNER"
      }  
    }).promise()

    const ownersResult:ItemList = result.Items

    console.log("ownersResult - "+JSON.stringify(ownersResult));
    console.log("length - "+ownersResult.length);

    let owners:Owner[] = ownersResult.map(mapOwnerObjectFromDBObject);

    const pets = await this.docClient.query({
        TableName: this.petClinicTable,
        IndexName: this.petClinicGSI,
        KeyConditionExpression: 'sort_key = OWNER_PET'      
      }).promise();

      console.dir("owners - "+owners, { depth: null });

    return owners;
  } 



   */

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

function getDBObjectToSave(ownerId: string, item:CreateUpdatePetRequest): any{
    console.log("CreateUpdatePetRequest - "+JSON.stringify(item));
    
    return {
        data: ownerId,
        parition_key: item.petId == null ? uuid.v4() : item.petId,
        sort_key: PET_SORT_KEY,        
        petName: item.petName,
        type: item.type,
        dob: item.dob
    }
}

function mapPetObjectFromDBObject(item: any): Pet{
    var pet:Pet = {        
        petId: item.parition_key as string,
        petName: item.petName as string,
        type: item.type as string,
        dob: item.dob as string
    }; 

    return pet;
}

function getVisitDBObjectToSave(petId:string, visitData:VisitInfo): any{
  return {    
    parition_key: petId,
    sort_key: visitData.visitId == null ? uuid.v4() : visitData.visitId,       
    data: visitData.visitDate,
    visit_desc: visitData.visitDesc,
  }

}

function mapVisitObjectFromDB(item: any): VisitInfo{
  return {
    visitId: item.sort_key,
    petId: item.parition_key,
    visitDate: item.data,
    visitDesc: item.visit_desc
  }
}
