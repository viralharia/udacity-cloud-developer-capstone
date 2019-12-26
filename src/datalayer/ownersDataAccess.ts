import { DocumentClient, ItemList } from 'aws-sdk/clients/dynamodb'
import { Owner } from '../models/Owner'
import { CreateUpdateOwnerRequest } from "../requests/CreateUpdateOwnerRequest";
import * as uuid from 'uuid'

const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const OWNER_SORT_KEY:string = "OWNER";

export class OwnerDataAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly petClinicTable = process.env.PETCLINIC_TABLE,
    private readonly petClinicGSI = process.env.PETCLINIC_TABLE_GLOBAL_INDEX_NAME) {
  }

  async getAllPetsOwnersInfo(): Promise<Owner[]> {
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
    console.log("ownersResult length - "+ownersResult.length);

    let owners:Owner[] = ownersResult.map(mapOwnerObjectFromDBObject);

    const pets = await this.docClient.query({
        TableName: this.petClinicTable,
        IndexName: this.petClinicGSI,
        KeyConditionExpression: 'sort_key = :key_value',
        ExpressionAttributeValues: {
            ':key_value': "OWNER_PET"
        }    
      }).promise();

    const petsResult:ItemList = pets.Items;
    console.log("petsResult length - "+petsResult.length);

    let item;
    for(item of petsResult){
        owners.find(owner => owner.ownerId === item.data).pets.push(item.petName);
    }

    return owners;
  }

  async createPetOwner(item: CreateUpdateOwnerRequest): Promise<Owner> {

    console.log("in OwnerDataAccess - createPetOwner...");

    let ownerToSave = getDBObjectToSave(item);
    
    await this.docClient.put({
      TableName: this.petClinicTable,
      Item: ownerToSave,

    }).promise();    
    return mapOwnerObjectFromDBObject(ownerToSave);
  }

  async updatePetOwner(ownerId: string, updateOwnerRequest: CreateUpdateOwnerRequest):Promise<Owner>{
    console.log("in OwnerDataAccess - updatePetOwner...");
    const result =  await this.docClient.update({
      TableName: this.petClinicTable,
      Key:{
        "parition_key": ownerId,
        "sort_key": OWNER_SORT_KEY
      },
      UpdateExpression: 'SET data = :lastName, firstName = :firstName, address = :address, city = :city, phone = :phone',
      ExpressionAttributeValues: {
        ':lastName': updateOwnerRequest.lastName,
        ':firstName': updateOwnerRequest.firstName,
        ':address': updateOwnerRequest.address,
        ':city': updateOwnerRequest.city,
        ':phone': updateOwnerRequest.telephone
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    return mapOwnerObjectFromDBObject(result.Attributes);
  }

  async getOwnerInfo(ownerId: string):Promise<Owner>{
    const result = await this.docClient.get({
          TableName: this.petClinicTable,
          Key:{
              'parition_key': ownerId,
              'sort_key': OWNER_SORT_KEY
          }
      }).promise();

      return mapOwnerObjectFromDBObject(result.Item);
  }

  /*
  async updateToDoItemAttachmentURL(todoItemId:string, userId: string, imageUrl:string):Promise<void>{

    await this.docClient.update({
      TableName: this.TodosTable,
      Key:{
        "todoId": todoItemId,
        "userId": userId
      },
      UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': imageUrl
      }
    }).promise();

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

function getDBObjectToSave(item:CreateUpdateOwnerRequest): any{
    console.log("CreateUpdateOwnerRequest - "+JSON.stringify(item));
    console.log("item id undefined - "+item.ownerId == null);
    return {
        parition_key: item.ownerId == null ? uuid.v4() : item.ownerId,
        sort_key: OWNER_SORT_KEY,
        data: item.lastName,
        firstName: item.firstName,
        address: item.address,
        city: item.city,
        phone: item.telephone
    }
}

function mapOwnerObjectFromDBObject(item: any): Owner{
    var owner:Owner = {
        ownerId: item.parition_key as string,
        firstName: item.firstName as string,
        lastName: item.data as string,
        address: item.address as string,
        city: item.city as string,
        telephone: item.phone as string,
        pets: []
    }; 

    return owner;
}
