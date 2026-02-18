import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{ title: "Pet Store" })
namespace PetStore;

model Pet {
  id: int32;
  name: string;
  status: "available" | "pending" | "sold";
}

@route("/pets")
interface Pets {
  @operationId("listPets")
  @useAuth(Auth0<["read:pets"]>)
  @get
  listPets(
    @query status?: "available" | "pending" | "sold",
    @query limit?: int32 = 20,
    @query offset?: int32 = 0,
    @query sortBy?: "name" | "status" | "id" = "id",
    @query sortOrder?: "asc" | "desc" = "asc",
  ): Pet[];

  @operationId("getPet")
  @useAuth(Auth0<["read:pets"]>)
  @get
  getPet(@path petId: int32): Pet;

  @operationId("createPet")
  @useAuth(Auth0<["read:pets", "write:pets"]>)
  @post
  createPet(@body pet: Pet): {
    @statusCode statusCode: 201;
    @body body: Pet;
  };
}

@extension("x-amazon-apigateway-authtype", "custom")
@extension(
  "x-amazon-apigateway-authorizer",
  #{
    type: "token",
    authorizerUri: "arn:aws:apigateway:eu-central-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-central-1:\${AWS::AccountId}:function:\${stageVariables.authorizer}/invocations",
    authorizerResultTtlInSeconds: 300,
  }
)
model Auth0<Scopes extends string[]>
  is OAuth2Auth<
    [
      {
        type: OAuth2FlowType.implicit;
        authorizationUrl: "https://auth.example.com/oauth2/authorize";
      }
    ],
    Scopes
  >;
