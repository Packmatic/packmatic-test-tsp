namespace Notifications;

// ─── Shared dealroom customer parameters ────────────────────────

model DealroomCustomerParameters {
  customerFirstName?: string;
  customerName: string;
  kamFullName: string;
  kamTitle: string;
  kamEmail: string;
}

model DealroomInternalParameters {
  customerName: string;
  dealroomTitle: string;
  companyName: string;
  documentSubmitterName: string;
}

// ─── Document requests (customer-facing) ────────────────────────

model DealroomDocumentUploadRequested {
  ...BaseNotificationFields;
  message: "DealroomDocumentUploadRequested";
  parameters: DealroomCustomerParameters;
}

model DealroomDocumentRevisionRequested {
  ...BaseNotificationFields;
  message: "DealroomDocumentRevisionRequested";
  parameters: DealroomCustomerParameters;
}

model DealroomAdditionalDocumentRequested {
  ...BaseNotificationFields;
  message: "DealroomAdditionalDocumentRequested";
  parameters: {
    ...DealroomCustomerParameters;
    documentName: string;
    documentNotes: string;
  };
}

model DealroomTenderResultsReady {
  ...BaseNotificationFields;
  message: "DealroomTenderResultsReady";
  parameters: DealroomCustomerParameters;
}

model DealroomCustomerReviewRequested {
  ...BaseNotificationFields;
  message: "DealroomCustomerReviewRequested";
  parameters: DealroomCustomerParameters;
}

// ─── Internal notifications ─────────────────────────────────────

model DealroomInternalCustomerSubmittedDocuments {
  ...BaseNotificationFields;
  message: "DealroomInternalCustomerSubmittedDocuments";
  parameters: DealroomInternalParameters;
}

model DealroomInternalCustomerSubmittedRevisions {
  ...BaseNotificationFields;
  message: "DealroomInternalCustomerSubmittedRevisions";
  parameters: DealroomInternalParameters;
}

model DealroomInternalCustomerUploadedNewlyRequestedDocument {
  ...BaseNotificationFields;
  message: "DealroomInternalCustomerUploadedNewlyRequestedDocument";
  parameters: DealroomInternalParameters;
}

// ─── External notification tracking ─────────────────────────────

model DealroomExternalNotificationWasSent {
  ...BaseNotificationFields;
  message: "DealroomExternalNotificationWasSent";
  parameters: {
    emailName: string;
    emailDescription: string;
    dealroomId: string;
    dealroomTitle: string;
    customerCompanyName: string;
  };
}

// ─── Customer portal ────────────────────────────────────────────

model PackaPortalCustomerLogin {
  ...BaseNotificationFields;
  message: "PackaPortalCustomerLogin";
  parameters: {
    userFullName: string;
    customerCompanyName: string;
    dealrooms: {
      id: string;
      title?: string;
      link: string;
    }[];
  };
}
