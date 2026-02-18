import ky from "ky";
import { createClient } from "@ube-tsp/ky-client";
import { operationMap, type OperationMap } from "./tsp-output/@ube-tsp/ky-emitter/operation-map.js";

const api = createClient<OperationMap>(ky.create({ prefixUrl: "https://petstore.example.com" }), operationMap);

// ─── Pagination with response headers ────────────────────────────

const page = await api.PetStore.Pets.list({
  params: {
    query: { status: "available", tag: "golden-retriever", sortBy: "name", sortOrder: "asc", page: 1, pageSize: 10 },
  },
});

console.log(page.response.headers["x-total-count"]); // total items
console.log(page.response.headers["x-page"]); // current page
console.log(page.response.content); // Pet[]

// ─── Request headers (x-request-id) ─────────────────────────────

const pet = await api.PetStore.Pets.get({
  params: {
    path: { petId: 1 },
    header: { "x-request-id": "req-abc-123" },
  },
});

if (pet.response.statusCode === 200) {
  console.log(pet.response.content); // Pet
} else {
  console.log(pet.response.content.message); // 404 error
}

// ─── Create ──────────────────────────────────────────────────────

const created = await api.PetStore.Pets.create({
  params: { header: { "x-request-id": "req-def-456" } },
  body: { name: "Buddy", status: "available", tag: "golden-retriever" },
});
console.log(created.response.content); // Pet with id

// ─── Conditional update with if-match / etag ─────────────────────

const updated = await api.PetStore.Pets.update({
  params: {
    path: { petId: 1 },
    header: { "if-match": '"etag-v1"', "x-request-id": "req-ghi-789" },
  },
  body: { name: "Buddy Jr.", status: "sold" },
});

if (updated.response.statusCode === 200) {
  console.log(updated.response.headers.etag); // new etag
  console.log(updated.response.content); // updated Pet
} else if (updated.response.statusCode === 409) {
  console.log("Conflict:", updated.response.content.message);
}

// ─── Delete ──────────────────────────────────────────────────────

const deleted = await api.PetStore.Pets.delete_({
  params: {
    path: { petId: 1 },
    header: { "x-request-id": "req-jkl-012" },
  },
});

if (deleted.response.statusCode === 204) {
  console.log("Pet deleted");
}

// ─── Nested namespace (Admin) ────────────────────────────────────

const users = await api.PetStore.Admin.Users.list();
console.log(users.response.content); // User[]

const user = await api.PetStore.Admin.Users.get({ params: { path: { userId: 1 } } });
console.log(user.response.content.role); // "admin" | "viewer"

// ─── kyOptions passthrough (timeout, retry, custom headers) ──────

const withOptions = await api.PetStore.Pets.get({ params: { path: { petId: 42 } } }, { timeout: 5000, retry: 3 });
console.log(withOptions.response.content);
