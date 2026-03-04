namespace Notifications;

// ─── Shared parameters ──────────────────────────────────────────

model QualificationStateChangeParameters {
  qualification: {
    title: string;
    customer: string;
    supplier: string;
    mainStage: string;
    subStage: string;
    projectPackmaticId: string;
  };
}

// ─── Qualification state change variants ────────────────────────

model NewQualificationCreated {
  ...BaseNotificationFields;
  message: "NewQualificationCreated";
  parameters: QualificationStateChangeParameters;
}

model QualificationPreparationCompleted {
  ...BaseNotificationFields;
  message: "QualificationPreparationCompleted";
  parameters: QualificationStateChangeParameters;
}

model QualificationSamplingCompleted {
  ...BaseNotificationFields;
  message: "QualificationSamplingCompleted";
  parameters: QualificationStateChangeParameters;
}

model QualificationIndustrialTestCompleted {
  ...BaseNotificationFields;
  message: "QualificationIndustrialTestCompleted";
  parameters: QualificationStateChangeParameters;
}

model QualificationMarkedAsQualified {
  ...BaseNotificationFields;
  message: "QualificationMarkedAsQualified";
  parameters: QualificationStateChangeParameters;
}

model QualificationCanceled {
  ...BaseNotificationFields;
  message: "QualificationCanceled";
  parameters: QualificationStateChangeParameters;
}

model InitiateQualificationPriceUpdate {
  ...BaseNotificationFields;
  message: "InitiateQualificationPriceUpdate";
  parameters: QualificationStateChangeParameters;
}
