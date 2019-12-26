import { VetDataAccess } from "../datalayer/vetDataAccess";
import { VetDTO } from "../models/VetDTO";

const vetDataAccess: VetDataAccess = new VetDataAccess();

export async function getAllVetsInfo():Promise<VetDTO[]>{
    return await vetDataAccess.getAllVetsInfo();
}
