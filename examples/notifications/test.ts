import ky from "ky";
import { createClient } from "@ube-tsp/ky-client";
import { operationMap, type OperationMap } from "./tsp-output/@ube-tsp/ky-emitter/operation-map.ts";

const AUTH_TOKEN = process.env.AUTH_TOKEN;
if (!AUTH_TOKEN) {
  console.error("Missing AUTH_TOKEN environment variable");
  process.exit(1);
}

const api = createClient<OperationMap>(
  ky.create({
    prefixUrl: "http://localhost:8007",
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  }),
  operationMap,
);

const result = await api.Notifications.create({
  params: { path: { tenant: "pm.acme" } },
  body: {
    message: "DealroomDocumentUploadRequested",
    recipients: ["michael.lopez@packmatic.io"],
    link: "https://app.example.com/dealrooms/404",
    parameters: {
      customerFirstName: "Jane",
      customerName: "Jane Doe",
      kamFullName: "Alice Smith",
      kamTitle: "Key Account Manager",
      kamEmail: "alice@packmatic.io",
    },
  },
});

if (result.response.statusCode === 202) {
  console.log("Notification queued:", result.response.headers.location);
} else if (result.response.statusCode === 400) {
  console.log("Validation error:", result.response.content.message);
  console.log("Details:", result.response.content.errors);
} else if (result.response.statusCode === 401) {
  console.log("Unauthorized:", result.response.content.message);
  console.log("Incident:", result.response.content.incident);
  console.log("Errors:", result.response.content.errors);
} else if (result.response.statusCode === 403) {
  console.log("Forbidden:", result.response.content.message);
  console.log("Path:", result.response.content.path);
} else {
  console.log("Server error:", result.response.content.message);
  console.log("Incident:", result.response.content.incident);
  console.log("Status:", result.response.content.status, result.response.content.name);
}
