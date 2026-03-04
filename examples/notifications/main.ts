import ky from "ky";
import { createClient } from "@ube-tsp/ky-client";
import { operationMap, type OperationMap } from "./tsp-output/@ube-tsp/ky-emitter/operation-map.js";

const AUTH_TOKEN = process.env.AUTH_TOKEN;
if (!AUTH_TOKEN) {
  console.error("Missing AUTH_TOKEN environment variable");
  process.exit(1);
}

const api = createClient<OperationMap>(
  ky.create({
    prefixUrl: "https://api.example.com/notifications",
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  }),
  operationMap,
);

// ─── Send a generic notification ─────────────────────────────────

const generic = await api.Notifications.create({
  params: { path: { tenant: "acme.corp" } },
  body: {
    message: "Generic",
    recipients: ["urn:users:acme.corp:user/alice"],
    link: "https://app.example.com/dashboard",
    locale: "en-us",
    parameters: {
      header: "System Maintenance",
      body: "<p>Scheduled downtime on Saturday.</p>",
    },
  },
});

if (generic.response.statusCode === 202) {
  console.log("Created:", generic.response.headers.location);
}

// ─── Send an offer feedback notification ─────────────────────────

await api.Notifications.create({
  params: { path: { tenant: "acme.corp" } },
  body: {
    message: "OfferFeedback",
    recipients: ["supplier@example.com"],
    link: "https://app.example.com/offers/123",
    parameters: {
      feedback: "Please revise pricing for item #5",
      supplierId: "supplier-001",
      requestId: "req-456",
      packmaticId: "PM-2024-001",
    },
  },
});

// ─── Send a new comment notification (nested objects) ────────────

await api.Notifications.create({
  params: { path: { tenant: "acme.corp" } },
  body: {
    message: "NewSpecComment",
    recipients: ["urn:users:acme.corp:role/customer", "urn:users:acme.corp:user/bob"],
    link: "https://app.example.com/specs/789",
    parameters: {
      comment: {
        body: "Updated the material spec, please review.",
        createdAt: "2026-03-03T10:30:00Z",
        createdBy: "Alice Smith",
      },
      spec: {
        title: "Corrugated Box - 400x300x200",
        packagingType: "corrugated",
        projectPackmaticId: "PM-2024-002",
      },
      customer: {
        name: "Acme Corp",
      },
    },
  },
});

// ─── Artwork request ─────────────────────────────────────────────

await api.Notifications.create({
  params: { path: { tenant: "acme.corp" } },
  body: {
    message: "PackaArtworkRequestDesignHandover",
    recipients: ["designer@example.com"],
    link: "https://app.example.com/artwork/101",
    parameters: {
      customerName: "Acme Corp",
      requesterName: "Alice Smith",
      requesterEmail: "alice@acme.com",
      recipientName: "Bob Designer",
      articleName: "Premium Gift Box",
      deadline: "2026-03-15",
    },
  },
});

// ─── Supplier task assignment ────────────────────────────────────

await api.Notifications.create({
  params: { path: { tenant: "acme.corp" } },
  body: {
    message: "NewSupplierTaskAssignedToSupplier",
    recipients: ["supplier@example.com"],
    link: "https://app.example.com/tasks/202",
    parameters: {
      taskDueDate: "2026-03-20",
      taskId: "task-202",
      taskTitle: "Submit material certification",
      taskDescription: "Please provide the FSC certification for corrugated board.",
      taskRequirementsSummary: "FSC certification document",
      taskPriority: "high",
      supplierAttachmentCount: "0",
      internalAttachmentCount: "1",
    },
  },
});

// ─── Qualification state change ──────────────────────────────────

await api.Notifications.create({
  params: { path: { tenant: "acme.corp" } },
  body: {
    message: "QualificationMarkedAsQualified",
    recipients: ["urn:users:acme.corp:role/customer"],
    link: "https://app.example.com/qualifications/303",
    parameters: {
      qualification: {
        title: "Premium Gift Box Qualification",
        customer: "Acme Corp",
        supplier: "BoxCo",
        mainStage: "qualified",
        subStage: "completed",
        projectPackmaticId: "PM-2024-003",
      },
    },
  },
});

// ─── Handle error responses ──────────────────────────────────────

const result = await api.Notifications.create({
  params: { path: { tenant: "acme.corp" } },
  body: {
    message: "DealroomDocumentUploadRequested",
    recipients: ["customer@example.com"],
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

const r = await api.Notifications.getPet();

if (r.response.statusCode === 200) {
  console.log("Pet:", r.response.content[0].name);
}
