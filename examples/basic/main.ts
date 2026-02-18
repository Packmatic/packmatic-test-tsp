import ky from "ky";
import { createClient } from "@ube-tsp/ky-client";
import { operationMap, type OperationMap } from "./tsp-output/@ube-tsp/ky-emitter/operation-map.js";

const api = createClient<OperationMap>(ky.create({ prefixUrl: "https://petstore.example.com" }), operationMap);

// List pets with filtering and sorting
const list = await api.PetStore.Pets.listPets({
  params: {
    query: { status: "available", limit: 10, offset: 0, sortBy: "name", sortOrder: "asc" },
  },
});
console.log(list.response.content);

// Get a pet
const pet = await api.PetStore.Pets.getPet({ params: { path: { petId: 1 } } });
console.log(pet.response.content);

// Create a pet
const created = await api.PetStore.Pets.createPet({
  body: { id: 2, name: "Buddy", status: "available" },
});
console.log(created.response.statusCode);
