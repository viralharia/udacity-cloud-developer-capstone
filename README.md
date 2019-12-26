# Serverless Pet-Clinic Application

This project implements a serverless version of the famous [Spring framework's PetClinic](https://projects.spring.io/spring-petclinic/) application using [AWS Lambda](https://aws.amazon.com/lambda/) and [Serverless framework](https://serverless.com/). 

# Purpose of the application
The users of the application are employees of the pet clinic who in the course of their work need to view and manage information regarding the veterinarians, the pet-owners, their pets and their visits to the clinic.

# Functionality and Scope of the application

This application will allow creating/updating/fetching pet-owners and their pets. It also allows to create/view the pet's visits to the clinic and also view all the vets along with their specalties registered with the clinic.

**Scope:** : To develop the server side services only required to acheive the above purpose and functionality.

# API endpoints of the app
Below are the API endpoints available in the application.

## Pet-owner related
- Get all Pet-Owners info along with their pets
```
GET - {api_url}/owners
```
- Get all info of a particular pet-owner including all pets and pet's visit history
```
GET - {api_url}/owners/{ownerId}
```
- Add a new pet-owner
```
POST - {api_url}/owners
```
- Update pet-owner info
```
PUT - {api_url}/owners/{ownerId}
```

## Pet related
- Add a new pet
```
POST - {api_url}/owners/{ownerId}/pets
```
- Update pet info
```
PUT - {api_url}/owners/{ownerId}/pets/{petId}
```

## Vets related
- Get all vets info along with their specialties
```
GET - {api_url}/vets
```

## Add visit info of a pet
```
POST - {api_url}/owners/{ownerId}/pets/{petId}/visits
```  

## Authentication
The app uses [Auth0]() service to authenticate the users.
All the `POST` method requires the JWT token to be passed in the request.

#### To generate the JWT token manually hit the below url in your browser and copy the **_'access_token'_** value from the address bar of the browser.
```
https://udagram-serverless.auth0.com/authorize?response_type=token&client_id=9XYDaaE8cB7byIrrIeH4kuUYMTdzDm6r&redirect_uri=http://localhost:3000/callback&scope=read:tests&audience=https://udagram-serverless.auth0.com/api/v2/&state=xyzABC123&nonce=eq...hPmz"
```
The application uses DynamoDB table to store the data.

**Demo of the application is deployed at:** https://w71aps1frh.execute-api.ap-south-1.amazonaws.com/dev/


# Postman collection

You can use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

Click on the import button:

![Alt text](screenshots/import-collection-1.png?raw=true "Image 1")


Click on the "Choose Files":

![Alt text](screenshots/import-collection-2.png?raw=true "Image 2")


Select a file to import:

![Alt text](screenshots/import-collection-3.png?raw=true "Image 3")


Right click on the imported collection to set variables for the collection:

![Alt text](screenshots/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection:

![Alt text](screenshots/import-collection-5.png?raw=true "Image 5")

# List of AWS services used
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [DynamoDB](https://aws.amazon.com/dynamodb/)
- [AWS X-Ray](https://aws.amazon.com/xray/)
- [AWS CloudWatch](https://aws.amazon.com/cloudwatch/)