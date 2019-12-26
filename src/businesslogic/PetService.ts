import { Pet } from "../models/Pet";
import { CreateUpdatePetRequest } from "../requests/CreateUpdatePetRequest";
import { PetDataAccess } from "../datalayer/petDataAccess";
import { VisitInfo } from "../models/VisitInfo";

const petDataAccess: PetDataAccess = new PetDataAccess();

export async function addNewPet(ownerId: string, petData: CreateUpdatePetRequest):Promise<Pet>{
    return await petDataAccess.addNewPet(ownerId, petData);
}

export async function editPet(ownerId: string, petId: string, petData: CreateUpdatePetRequest):Promise<Pet>{
    return await petDataAccess.editPet(ownerId, petId, petData);
}

export async function getAllVisitsOfPet(petId: string):Promise<VisitInfo[]>{
    return await petDataAccess.getAllVisitsInfoOfPet(petId);
}

export async function addNewVisit(petId:string, visitData: VisitInfo):Promise<VisitInfo>{
    return await petDataAccess.addNewVisit(petId, visitData);
}