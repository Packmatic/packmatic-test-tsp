import { t, type TesterInstance } from "@typespec/compiler/testing";
import { beforeEach, it } from "vitest";
import { OperationMap, OperationTypeMap } from "../src/components/operation-map.jsx";
import { expectRender, Tester } from "./utils.jsx";

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it("complex", async () => {
  const { Base } = await runner.compile(t.code`
    namespace ${t.namespace("Base")} {
      model Pet {
        name: string;
      }

      @get
      @route("/pets/{petId}")
      op getPet(@path petId: int32): Pet;

      namespace Foo {
        namespace Bar {
          interface Buzz {
            @get
            @route("/pets")
            op listPets(): Pet[];
          }
        }
      }
    }
  `);

  expectRender(
    runner.program,
    <OperationMap ns={Base} />,
    `
      import { type Options, type KyResponse } from "ky";
      export const operationMap = {
        getPet: {
          operationId: "getPet",
          method: "GET",
          path: "/pets/{petId}",
          response: {
            "200": {
              headers: [],
              contentTypes: ["application/json"],
            },
          },
        },
        "Foo.Bar.Buzz.listPets": {
          operationId: "listPets",
          method: "GET",
          path: "/pets",
          response: {
            "200": {
              headers: [],
              contentTypes: ["application/json"],
            },
          },
        },
      };
      export type OperationMap = {
        getPet: (params: {
          params: {
            path: {
              petId: number;
            };
            query?: never;
            header?: never;
            cookie?: never;
          };
          body?: never;
        }, kyOptions?: Options) => Promise<{
          response: {
            statusCode: 200;
            headers?: never;
            content: {
              name: string;
            };
          };
          kyResponse: KyResponse;
        }>;
        Foo: {
          Bar: {
            Buzz: {
              listPets: (params?: {
                params?: never;
                body?: never;
              }, kyOptions?: Options) => Promise<{
                response: {
                  statusCode: 200;
                  headers?: never;
                  content: {
                    name: string;
                  }[];
                };
                kyResponse: KyResponse;
              }>;
            };
          };
        };
      };
    `,
  );
});

it("operation map with global namespace as base", async () => {
  await runner.compile(t.code`
    namespace Pets {
      model Pet {
        name: string;
      }

      interface PetStore {
        @get
        @route("/pets")
        op listPets(): Pet[];
      }
    }
  `);

  const globalNs = runner.program.getGlobalNamespaceType();

  expectRender(
    runner.program,
    <OperationMap ns={globalNs} />,
    `
      import { type Options, type KyResponse } from "ky";
      export const operationMap = {
        "Pets.PetStore.listPets": {
          operationId: "listPets",
          method: "GET",
          path: "/pets",
          response: {
            "200": {
              headers: [],
              contentTypes: ["application/json"],
            },
          },
        },
      };
      export type OperationMap = {
        Pets: {
          PetStore: {
            listPets: (params?: {
              params?: never;
              body?: never;
            }, kyOptions?: Options) => Promise<{
              response: {
                statusCode: 200;
                headers?: never;
                content: {
                  name: string;
                }[];
              };
              kyResponse: KyResponse;
            }>;
          };
        };
      };
    `,
  );
});

it("operation type map", async () => {
  const { Base } = await runner.compile(t.code`
    namespace ${t.namespace("Base")} {
      model Pet {
        name: string;
      }
      @get
      @route("/pet/{petId}")
      op getPet(@path petId: int32): Pet;
      @delete
      @route("/pet/{petId}")
      op deletePet(@path petId: int32): {
        @statusCode _: 204;
      };

      model Tag {
        value: string;
      }
      namespace Foo {
        model Bar {
          name: string;
        }
        interface Buzz {
          @get
          @route("/pets")
          op listPets(): Pet[];
        }
      }
      namespace Other {
        model More {
          name: string;
        }
        namespace Here {
          model There {
            name: string;
          }
          namespace Everywhere {
            model Where {
              location?: string;
            }
          }
        }
      }
    }
  `);

  expectRender(
    runner.program,
    <OperationTypeMap ns={Base} />,
    `
      {
        getPet: (params: {
          params: {
            path: {
              petId: number;
            };
            query?: never;
            header?: never;
            cookie?: never;
          };
          body?: never;
        }, kyOptions?: Options) => Promise<{
          response: {
            statusCode: 200;
            headers?: never;
            content: {
              name: string;
            };
          };
          kyResponse: KyResponse;
        }>;
        deletePet: (params: {
          params: {
            path: {
              petId: number;
            };
            query?: never;
            header?: never;
            cookie?: never;
          };
          body?: never;
        }, kyOptions?: Options) => Promise<{
          response: {
            statusCode: 204;
            headers?: never;
            content?: never;
          };
          kyResponse: KyResponse;
        }>;
        Foo: {
          Buzz: {
            listPets: (params?: {
              params?: never;
              body?: never;
            }, kyOptions?: Options) => Promise<{
              response: {
                statusCode: 200;
                headers?: never;
                content: {
                  name: string;
                }[];
              };
              kyResponse: KyResponse;
            }>;
          };
        };
        Other: {
          Here: {
            Everywhere: never;
          };
        };
      }
    `,
  );
});
