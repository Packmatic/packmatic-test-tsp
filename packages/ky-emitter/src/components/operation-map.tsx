import { code, For } from "@alloy-js/core";
import { StatementList } from "@alloy-js/core/stc";
import {
  InterfaceExpression,
  InterfaceMember,
  ObjectExpression,
  ObjectProperty,
  TypeDeclaration,
  VarDeclaration,
} from "@alloy-js/typescript";
import { getNamespaceFullName, type Interface, type Namespace, type Operation } from "@typespec/compiler";
import type { Typekit } from "@typespec/compiler/typekit";
import { useTsp } from "@typespec/emitter-framework";
import { createRequestModel } from "../parts/request.js";
import { createResponseModel } from "../parts/response.js";
import { getOpNamespacePath, OperationObjectExpression } from "./operation.jsx";
import { TsSchema } from "./ts-schema.jsx";

interface OperationMapProps {
  ns: Namespace;
}
export function OperationMap({ ns }: OperationMapProps) {
  const { $ } = useTsp();
  const operations = getOperations($, ns);

  return (
    <>
      <StatementList>
        {code`import { type Options, type KyResponse } from "ky"`}
        <VarDeclaration name="operationMap" const export>
          <OperationObjectMap operations={operations} baseNs={ns} />
        </VarDeclaration>
      </StatementList>
      {"\n"}
      <TypeDeclaration name="OperationMap" export>
        <OperationTypeMap ns={ns} />
      </TypeDeclaration>
    </>
  );
}

interface Props {
  operations: Operation[];
  baseNs: Namespace;
}
function OperationObjectMap({ operations, baseNs }: Props) {
  const baseNsPath = getNamespaceFullName(baseNs);
  return (
    <ObjectExpression>
      <For each={operations} comma hardline enderPunctuation>
        {(op) => {
          const nsPath = baseNsPath
            ? getOpNamespacePath(op).replace(`${baseNsPath}.`, "")
            : getOpNamespacePath(op);
          return (
            <ObjectProperty name={nsPath}>
              <OperationObjectExpression op={op} />
            </ObjectProperty>
          );
        }}
      </For>
    </ObjectExpression>
  );
}

// interface Props {
//   operations: Operation[];
// }
// function OperationTypeMap({ operations }: Props) {
//   const { $ } = useTsp();
//   return (
//     <For each={operations} semicolon hardline enderPunctuation>
//       {(op) => {
//         const nsPath = getOpNamespacePath(op);
//         return (
//           <InterfaceMember
//             name={nsPath}
//             type={
//               <InterfaceExpression>
//                 <StatementList>
//                   <InterfaceMember
//                     name="request"
//                     type={<TsSchema type={createRequestModel($, op)} />}
//                   />
//                   <InterfaceMember
//                     name="response"
//                     type={
//                       <TsSchema
//                         type={createResponseModel($, $.httpOperation.get(op))}
//                       />
//                     }
//                   />
//                 </StatementList>
//               </InterfaceExpression>
//             }
//           />
//         );
//       }}
//     </For>
//   );
// }

export function OperationTypeMap({ ns }: { ns: Namespace | Interface }) {
  const { $ } = useTsp();
  const childNsOrInter =
    "namespaces" in ns
      ? [...ns.namespaces.values(), ...ns.interfaces.values()].filter((ns) => $.type.isUserDefined(ns))
      : [];

  return ns.operations.size > 0 || childNsOrInter.length > 0 ? (
    <InterfaceExpression>
      <StatementList>
        {ns.operations.size > 0 && (
          <For each={ns.operations} semicolon hardline>
            {(_, op) => <OperationSignature op={op} />}
          </For>
        )}
        {childNsOrInter.length > 0 && (
          <For each={childNsOrInter} semicolon hardline>
            {(ns) => <InterfaceMember name={ns.name} type={<OperationTypeMap ns={ns} />} />}
          </For>
        )}
      </StatementList>
    </InterfaceExpression>
  ) : (
    "never"
  );
}

function OperationSignature({ op }: { op: Operation }) {
  const { $ } = useTsp();
  const requestModel = createRequestModel($, op);
  const allOptional = [...requestModel.properties.values()].every((param) => param.optional);
  const responseModel = createResponseModel($, $.httpOperation.get(op));
  return (
    <InterfaceMember
      name={op.name}
      type={code`(params${allOptional ? "?" : ""}: ${(<TsSchema type={requestModel} />)}, kyOptions?: Options) => Promise<${(
        <InterfaceExpression>
          <StatementList>
            <InterfaceMember name="response" type={<TsSchema type={responseModel} />} />
            <InterfaceMember name="kyResponse" type="KyResponse" />
          </StatementList>
        </InterfaceExpression>
      )}>`}
    />
  );
}

function getOperations($: Typekit, ns: Namespace | Interface): Operation[] {
  return [
    ...ns.operations.values(),
    ...("namespaces" in ns
      ? [
          ...[...ns.namespaces.values()].flatMap((ns) => ($.type.isUserDefined(ns) ? getOperations($, ns) : [])),
          ...[...ns.interfaces.values()].flatMap((inter) =>
            $.type.isUserDefined(inter) ? getOperations($, inter) : [],
          ),
        ]
      : []),
  ];
}
