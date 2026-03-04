import { code, For, Match, Prose, Switch } from "@alloy-js/core";
import { ArrayExpression, InterfaceExpression, InterfaceMember } from "@alloy-js/typescript";
import type { Enum, Model, Namespace, Scalar, Tuple, Type, Union } from "@typespec/compiler";
import { type Typekit } from "@typespec/compiler/typekit";
import { useTsp } from "@typespec/emitter-framework";
import { ValueExpression } from "@typespec/emitter-framework/typescript";

interface Props {
  type: Type;
  rootNs?: Namespace;
}
export function TsSchema({ type, rootNs }: Props) {
  const { $ } = useTsp();
  switch (type.kind) {
    case "Intrinsic":
      switch (type.name) {
        case "void":
          return "void";
        case "null":
          return "null";
        case "never":
          return "never";
        case "unknown":
        default:
          return "unknown";
      }
    case "String":
      return `"${type.value}"`;
    case "Number":
    case "Boolean":
      return type.value.toString();
    case "Scalar":
      return scalarBaseType($, type);
    case "Model":
      return modelBaseType($, type);
    case "Union":
      return unionBaseType($, type);
    case "Enum":
      return enumBaseType(type);
    case "ModelProperty":
      return <TsSchema type={type} {...(!!rootNs && { rootNs })} />;
    case "EnumMember":
      return (
        <Switch>
          <Match when={!!type.value}>
            <TsSchema type={$.literal.create(type.value!)} {...(!!rootNs && { rootNs })} />
          </Match>
          <Match else>
            <TsSchema type={$.literal.create(type.name)} {...(!!rootNs && { rootNs })} />
          </Match>
        </Switch>
      );
    case "Tuple":
      return tupleBaseType(type);
    default:
      return "unknown";
  }
}

function scalarBaseType($: Typekit, type: Scalar) {
  if ($.scalar.extendsBoolean(type)) {
    return "boolean";
  } else if ($.scalar.extendsNumeric(type)) {
    return "number";
  } else if ($.scalar.extendsString(type)) {
    return "string";
  } else if ($.scalar.extendsBytes(type)) {
    return "any";
  } else if ($.scalar.extendsPlainDate(type)) {
    return "string";
  } else if ($.scalar.extendsPlainTime(type)) {
    return "string";
  } else if ($.scalar.extendsUtcDateTime(type)) {
    return "string";
  } else if ($.scalar.extendsOffsetDateTime(type)) {
    return "string";
  } else if ($.scalar.extendsDuration(type)) {
    return "string";
  } else {
    return "any";
  }
}

function modelBaseType($: Typekit, type: Model) {
  if ($.array.is(type)) {
    return (
      <>
        <TsSchema type={type.indexer.value} />
        <ArrayExpression />
      </>
    );
  }

  if ($.record.is(type) || (type.properties.size === 0 && !!type.baseModel?.indexer)) {
    return code`Record<string, ${(<TsSchema type={(type.indexer ?? type.baseModel!.indexer)!.value} />)}>`;
  }

  const discriminated = $.model.getDiscriminatedUnion(type);
  if (discriminated) {
    const union = (
      <For each={discriminated.variants} joiner=" | ">
        {(_, variant) => {
          const allProperties = $.model.getProperties(variant, { includeExtended: true });
          return (
            <InterfaceExpression>
              <For each={allProperties} semicolon hardline enderPunctuation>
                {(_, property) => (
                  <InterfaceMember
                    name={property.name}
                    optional={property.optional || !!property.defaultValue}
                    doc={
                      !!property.defaultValue && (
                        <Prose>
                          @defaultValue `
                          <ValueExpression value={property.defaultValue} />`
                        </Prose>
                      )
                    }
                    type={<TsSchema type={property.type} />}
                  />
                )}
              </For>
            </InterfaceExpression>
          );
        }}
      </For>
    );
    // NOTE: Must use code`` for parens — raw text in JSX fragments (<>(...) </>) is silently dropped by Alloy
    return code`(${union})`;
  }

  return (
    <InterfaceExpression>
      <For each={type.properties} semicolon hardline enderPunctuation>
        {(_, property) => (
          <InterfaceMember
            name={property.name}
            optional={property.optional || !!property.defaultValue}
            doc={
              !!property.defaultValue && (
                <Prose>
                  @defaultValue `
                  <ValueExpression value={property.defaultValue} />`
                </Prose>
              )
            }
            type={<TsSchema type={property.type} />}
          />
        )}
      </For>
    </InterfaceExpression>
  );
}

function unionBaseType($: Typekit, type: Union) {
  const discriminated = $.union.getDiscriminatedUnion(type);

  if ($.union.isExpression(type) || !discriminated) {
    return (
      <For each={type.variants} joiner=" | ">
        {(_, variant) => <TsSchema type={variant.type} />}
      </For>
    );
  }

  const propKey = discriminated.options.discriminatorPropertyName;
  const envKey = discriminated.options.envelopePropertyName;
  return (
    <For each={type.variants} joiner=" | ">
      {(_, variant) => {
        if (discriminated.options.envelope === "object") {
          const envelope = $.model.create({
            properties: {
              [propKey]: $.modelProperty.create({
                name: propKey,
                type: $.literal.create(variant.name as string),
              }),
              [envKey]: $.modelProperty.create({
                name: envKey,
                type: variant.type,
              }),
            },
          });
          return <TsSchema type={envelope} />;
        } else {
          return <TsSchema type={variant.type} />;
        }
      }}
    </For>
  );
}

function enumBaseType(type: Enum) {
  return (
    <For each={type.members} joiner=" | ">
      {(_, member) => <TsSchema type={member} />}
    </For>
  );
}

function tupleBaseType(type: Tuple) {
  return (
    <ArrayExpression>
      <For each={type.values} comma line>
        {(item) => <TsSchema type={item} />}
      </For>
    </ArrayExpression>
  );
}
