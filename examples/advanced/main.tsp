import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{ title: "Pet Store (Advanced)" })
namespace PetStore;

// ─── Shared types ────────────────────────────────────────────────

/** Standard error envelope returned by all endpoints. */
@defaultResponse
model Error {
  code: int32;
  message: string;
}

/** Paginated list wrapper with response headers for pagination metadata. */
model PaginatedList<T> {
  @statusCode statusCode: 200;
  @header "x-total-count": int32;
  @header "x-page": int32;
  @header "x-page-size": int32;
  @body body: T[];
}

enum PetStatus {
  available,
  pending,
  sold,
}

enum SortOrder {
  asc,
  desc,
}

model Pet {
  id: int32;
  name: string;
  status: PetStatus;
  tag?: string;
  createdAt: utcDateTime;
}

model PetCreate {
  name: string;
  status?: PetStatus;
  tag?: string;
}

model PetUpdate {
  name?: string;
  status?: PetStatus;
  tag?: string;
}

// ─── Pets CRUD ───────────────────────────────────────────────────

@route("/pets")
interface Pets {
  /** List pets with filtering, sorting, and pagination. */
  @operationId("listPets")
  @get
  list(
    @query status?: PetStatus,
    @query tag?: string,
    @query sortBy?: "name" | "status" | "createdAt" = "createdAt",
    @query sortOrder?: SortOrder = SortOrder.asc,
    @query page?: int32 = 1,
    @query pageSize?: int32 = 20,
  ): PaginatedList<Pet>;

  /** Get a single pet by ID. Returns 404 if not found. */
  @operationId("getPet")
  @get
  get(@path petId: int32, @header "x-request-id"?: string): Pet | {
    @statusCode statusCode: 404;
    @body body: Error;
  };

  /** Create a new pet. */
  @operationId("createPet")
  @post
  create(@header "x-request-id"?: string, @body pet: PetCreate): {
    @statusCode statusCode: 201;
    @body body: Pet;
  };

  /** Full replace of a pet. Returns the updated pet with an ETag header. */
  @operationId("updatePet")
  @put
  update(
    @path petId: int32,
    @header "if-match"?: string,
    @header "x-request-id"?: string,
    @body pet: PetUpdate,
  ): {
    @statusCode statusCode: 200;
    @header etag: string;
    @body body: Pet;
  } | {
    @statusCode statusCode: 404;
    @body body: Error;
  } | {
    @statusCode statusCode: 409;
    @body body: Error;
  };

  /** Delete a pet by ID. */
  @operationId("deletePet")
  @delete
  delete(@path petId: int32, @header "x-request-id"?: string): {
    @statusCode statusCode: 204;
  } | {
    @statusCode statusCode: 404;
    @body body: Error;
  };
}

// ─── Admin namespace (nested) ────────────────────────────────────

namespace Admin {
  model User {
    id: int32;
    email: string;
    role: "admin" | "viewer";
  }

  @route("/admin/users")
  interface Users {
    @operationId("listUsers")
    @get
    list(): User[];

    @operationId("getUser")
    @get
    get(@path userId: int32): User;
  }
}
