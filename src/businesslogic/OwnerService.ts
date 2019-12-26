import { Owner } from "../models/Owner";
import { CreateUpdateOwnerRequest } from "../requests/CreateUpdateOwnerRequest";
import { OwnerDataAccess } from "../datalayer/ownersDataAccess";
import { Pet } from "../models/Pet";
import { PetDataAccess } from "../datalayer/petDataAccess";
import { VisitInfo } from "../models/VisitInfo";

const ownerDataAccess: OwnerDataAccess = new OwnerDataAccess();
const petDataAccess: PetDataAccess = new PetDataAccess();

export async function getAllOwners(): Promise<Owner[]> {
    return ownerDataAccess.getAllPetsOwnersInfo();
}

export async function createNewOwner(newOwner: CreateUpdateOwnerRequest): Promise<Owner>{
    return await ownerDataAccess.createPetOwner(newOwner);
}

export async function updateOwner(ownerId:string, owner: CreateUpdateOwnerRequest): Promise<Owner>{
    return await ownerDataAccess.updatePetOwner(ownerId,owner);
}

export async function getOwnerInfo(ownerId): Promise<any>{
    const ownerInfo: Owner = await ownerDataAccess.getOwnerInfo(ownerId);
    let finalObject:any = {
        'ownerInfo':ownerInfo,
        'petsAndVisits' : []
    }
    const pets: Pet[] = await petDataAccess.getAllPetsOfOwner(ownerId);
    console.log("got all pets - "+pets.length);
    let pet;
    for(pet of pets){
        const visits:VisitInfo[] = await petDataAccess.getAllVisitsInfoOfPet(pet.petId);
        let obj = {
            ...pet,
            'visits': visits
        }
        finalObject.petsAndVisits.push(obj);
    }

    return finalObject;

}