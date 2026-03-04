namespace Notifications;

// ─── Shared parameters ──────────────────────────────────────────

model ProjectAssignmentParameters {
  deliveryDate: string;
  dueDate: string;
  packmaticId: string;
  title: string;
  projectItemsCount: int32;
  totalAnnualDemand: string;
  totalOrderQuantity: string;
}

// ─── Project Assignment variants ────────────────────────────────

model NewProjectAssignmentSupplierOnboarded {
  ...BaseNotificationFields;
  message: "NewProjectAssignmentSupplierOnboarded";
  parameters: ProjectAssignmentParameters;
}

model UpdatedProjectAssignmentSupplierOnboarded {
  ...BaseNotificationFields;
  message: "UpdatedProjectAssignmentSupplierOnboarded";
  parameters: ProjectAssignmentParameters;
}

model NewProjectAssignmentSupplierNotOnboarded {
  ...BaseNotificationFields;
  message: "NewProjectAssignmentSupplierNotOnboarded";
  parameters: ProjectAssignmentParameters;
}

model UpdatedProjectAssignmentSupplierNotOnboarded {
  ...BaseNotificationFields;
  message: "UpdatedProjectAssignmentSupplierNotOnboarded";
  parameters: ProjectAssignmentParameters;
}

model ProjectAssignmentDeadlineReminder {
  ...BaseNotificationFields;
  message: "ProjectAssignmentDeadlineReminder";
  parameters: ProjectAssignmentParameters;
}

// ─── Project Results ────────────────────────────────────────────

model ProjectResultsSupplier {
  ...BaseNotificationFields;
  message: "ProjectResultsSupplier";
  parameters: {
    title: string;
    itemsQuoted: int32;
    packmaticId: string;
  };
}

// ─── CRP Outcome ────────────────────────────────────────────────

model CRPOutcomeSubmitted {
  ...BaseNotificationFields;
  message: "CRPOutcomeSubmitted";
  parameters: {
    winningSupplierNames: string[];
    keyAccountManagerName?: string;
    projectId: string;
    customerName: string;
    projectTitle: string;
    goatRating: string;
    goatScore: string;
    grossProfitLeadSupplier: string;
    shareOfWallet: string;
    customerPotentialScore: string;
    customerPotentialOption: string;
    customerReadinessScore: string;
    customerReadinessOption: string;
    customerSavings: string;
    buyerCommitment: string;
    timeline: string;
    qualificationEffort: string;
    gmvLeadSupplier: string;
    marginLeadSupplier: string;
    generalFeedback: string;
    pricingFeedback: string;
    commercialOrderStrategy: string;
    deliveryAsQuoted: string;
    firstCommercialOrderTarget: string;
    nextSteps: string;
    link: string;
  };
}
