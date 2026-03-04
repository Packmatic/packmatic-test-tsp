import { beforeEach, it } from "vitest";
import { TsSchema } from "../src/components/ts-schema.jsx";
import { Tester, expectRender } from "./utils.jsx";
import { t, type TesterInstance } from "@typespec/compiler/testing";

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it("works with basic models", async () => {
  const { Test } = await runner.compile(t.code`
    model ${t.model("Test")} {
      stringProp: string,
      optionalStringProp?: string
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    `
      {
        stringProp: string;
        optionalStringProp?: string;
      }
    `,
  );
});

it("works with models with basic constraints", async () => {
  const { Test } = await runner.compile(t.code`
    model ${t.model("Test")} {
      @maxLength(10)
      stringProp: string,

      @minValue(10)
      numberProp: float64
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    `
      {
        stringProp: string;
        numberProp: number;
      }
    `,
  );
});

it("works with records", async () => {
  const { Test, Test2 } = await runner.compile(t.code`
    model ${t.model("Test")} {
      ... Record<string>
    }

    model ${t.model("Test2")} extends Record<string> {}
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    `
Record<string, string>
    `,
  );

  expectRender(
    runner.program,
    <TsSchema type={Test2} />,
    `
Record<string, string>
    `,
  );
});

// Like Typebox we probably shouldn't handle additional props
// TypeScript does not support it
it("works with records with properties", async () => {
  const { Test } = await runner.compile(t.code`
    model ${t.model("Test")} {
      prop: "hi",
      ... Record<float64>
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    `
      {
        prop: "hi";
      }
    `,
  );
});

it("works with nested objects", async () => {
  const { Test } = await runner.compile(t.code`
    model ${t.model("Test")} {
      prop: {
        nested: true
      }
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    `
      {
        prop: {
          nested: true;
        };
      }
    `,
  );
});

it("works with arrays", async () => {
  const { scalarArray, scalarArray2, modelArray } = await runner.compile(t.code`
    model Test {
      ${t.modelProperty("scalarArray")}: string[];
      ${t.modelProperty("scalarArray2")}: string[][];
      ${t.modelProperty("modelArray")}: {x: string, y: string}[];
    }
  `);

  expectRender(runner.program, <TsSchema type={scalarArray.type} />, "string[]");
  expectRender(runner.program, <TsSchema type={scalarArray2.type} />, "string[][]");
  expectRender(
    runner.program,
    <TsSchema type={modelArray.type} />,
    `
      {
        x: string;
        y: string;
      }[]
    `,
  );
});

it("works with model properties with array constraints", async () => {
  const { Test } = await runner.compile(t.code`
    model ${t.model("Test")} {
      @maxItems(2)
      prop: string[]
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    `
      {
        prop: string[];
      }
    `,
  );
});

it("works with array declarations", async () => {
  const { Test } = await runner.compile(t.code`
    @maxItems(5)
    model ${t.model("Test")} is Array<string>{}
  `);

  expectRender(runner.program, <TsSchema type={Test} />, "string[]");
});

it("handles references", async () => {
  const { Test, Test2, Item } = await runner.compile(t.code`
    model ${t.model("Item")} {
      prop: string;
    };

    /** Simple array */
    model ${t.model("Test")} is Array<Item>{}

    model ${t.model("Test2")} {
      /** single array */
      prop1: Item[],

      /** nested array */
      @maxItems(5)
      prop2: Item[][],
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Item} />,
    `
      {
        prop: string;
      }
    `,
  );
  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    `
      {
        prop: string;
      }[]
    `,
  );
  expectRender(
    runner.program,
    <TsSchema type={Test2} />,
    `
      {
        prop1: {
          prop: string;
        }[];
        prop2: {
          prop: string;
        }[][];
      }
    `,
  );
});

it("makes default optional", async () => {
  const { Test } = await runner.compile(t.code`
    model ${t.model("Test")} {
      number: float64 = 5;
      string: string = "hello";
      boolean: boolean = true;
      array: string[] = #["hello"];
      null: null = null;
      dateTime: utcDateTime = utcDateTime.fromISO("2025-01-01T00:00:00Z");
      offsetDateTime: offsetDateTime = offsetDateTime.fromISO("2025-01-01T00:00:00+01:00");
      plainTime: plainTime = plainTime.fromISO("10:01:00");
      plainDate: plainDate = plainDate.fromISO("2025-01-01");
      duration: duration = duration.fromISO("P1Y2M3DT4H5M6S");
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    `
      {
        /**
         * @defaultValue \`5\`
         */
        number?: number;
        /**
         * @defaultValue \`"hello"\`
         */
        string?: string;
        /**
         * @defaultValue \`true\`
         */
        boolean?: boolean;
        /**
         * @defaultValue \`["hello"]\`
         */
        array?: string[];
        /**
         * @defaultValue \`null\`
         */
        null_?: null;
        /**
         * @defaultValue \`"2025-01-01T00:00:00Z"\`
         */
        dateTime?: string;
        /**
         * @defaultValue \`"2025-01-01T00:00:00+01:00"\`
         */
        offsetDateTime?: string;
        /**
         * @defaultValue \`"10:01:00"\`
         */
        plainTime?: string;
        /**
         * @defaultValue \`"2025-01-01"\`
         */
        plainDate?: string;
        /**
         * @defaultValue \`"P1Y2M3DT4H5M6S"\`
         */
        duration?: string;
      }
    `,
  );
});

it("works with @discriminator on model inheritance", async () => {
  const { Pet } = await runner.compile(t.code`
    @discriminator("kind")
    model ${t.model("Pet")} {
      kind: string;
      name: string;
      weight?: float64;
    }

    model Cat extends Pet {
      kind: "cat";
      meow: boolean;
    }

    model Dog extends Pet {
      kind: "dog";
      bark: boolean;
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Pet} />,
    `
      ({
        kind: "cat";
        meow: boolean;
        name: string;
        weight?: number;
      } | {
        kind: "dog";
        bark: boolean;
        name: string;
        weight?: number;
      })
    `,
  );
});
