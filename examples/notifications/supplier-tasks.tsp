namespace Notifications;

// ─── Shared parameters ──────────────────────────────────────────

model SupplierTaskParameters {
  taskDueDate: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  taskRequirementsSummary: string;
  taskPriority: string;
  supplierAttachmentCount: string;
  internalAttachmentCount: string;
}

// ─── Supplier Task variants ─────────────────────────────────────

model NewSupplierTaskAssignedToSupplier {
  ...BaseNotificationFields;
  message: "NewSupplierTaskAssignedToSupplier";
  parameters: SupplierTaskParameters;
}

model SupplierTaskDueSoon {
  ...BaseNotificationFields;
  message: "SupplierTaskDueSoon";
  parameters: SupplierTaskParameters;
}

model SupplierTaskOverdue {
  ...BaseNotificationFields;
  message: "SupplierTaskOverdue";
  parameters: SupplierTaskParameters;
}

model FollowUpSupplierTask {
  ...BaseNotificationFields;
  message: "FollowUpSupplierTask";
  parameters: SupplierTaskParameters;
}

model SupplierTaskCompletedBySupplier {
  ...BaseNotificationFields;
  message: "SupplierTaskCompletedBySupplier";
  parameters: SupplierTaskParameters;
}

model SupplierTaskCancelled {
  ...BaseNotificationFields;
  message: "SupplierTaskCancelled";
  parameters: SupplierTaskParameters;
}
