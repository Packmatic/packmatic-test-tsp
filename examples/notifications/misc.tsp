namespace Notifications;

// ─── Generic ────────────────────────────────────────────────────

model Generic {
  ...BaseNotificationFields;
  message: "Generic";
  parameters: {
    header?: string;
    body?: string;
  };
}

// ─── User Management ────────────────────────────────────────────

model PackaUserCreated {
  ...BaseNotificationFields;
  message: "PackaUserCreated";
  parameters: {
    recipientName: string;
    recipientEmail: string;
  };
}

// ─── Framework Check ────────────────────────────────────────────

model PackaFrameworkCheckBooked {
  ...BaseNotificationFields;
  message: "PackaFrameworkCheckBooked";
  parameters: {
    userName: string;
    tenant: string;
    frameworkId: string;
    message?: string;
    actorUrn: urn;
  };
}

// ─── Specification Requests ─────────────────────────────────────

model PackaSpecificationRequestCreated {
  ...BaseNotificationFields;
  message: "PackaSpecificationRequestCreated";
  parameters: {
    customerName: string;
    requesterName: string;
    requesterEmail: string;
    recipientName: string;
    specificationName: string;
  };
}

model PackaSpecificationRequestMessageSent {
  ...BaseNotificationFields;
  message: "PackaSpecificationRequestMessageSent";
  parameters: {
    customerName: string;
    requesterName: string;
    requesterEmail: string;
    recipientName: string;
    specificationRequestId: string;
    specificationName: string;
    message?: string;
  };
}

// ─── Document Request ───────────────────────────────────────────

model PackaDocumentRequestSupplier {
  ...BaseNotificationFields;
  message: "PackaDocumentRequestSupplier";
  parameters: {
    customerName: string;
    requesterName: string;
    requesterEmail: string;
    recipientName: string;
    documentTitle: string;
  };
}
