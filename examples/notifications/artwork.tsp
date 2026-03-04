namespace Notifications;

// ─── Shared artwork parameters ──────────────────────────────────

model ArtworkBaseParameters {
  customerName: string;
  requesterName: string;
  requesterEmail: string;
  recipientName: string;
  articleName: string;
}

// ─── Artwork Request variants ───────────────────────────────────

model PackaArtworkRequestCreated {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestCreated";
  parameters: ArtworkBaseParameters;
}

model PackaArtworkRequestAllRequirementsSubmitted {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestAllRequirementsSubmitted";
  parameters: ArtworkBaseParameters;
}

model PackaArtworkRequestRequirementsRestarted {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestRequirementsRestarted";
  parameters: ArtworkBaseParameters;
}

model PackaArtworkRequestDesignHandover {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestDesignHandover";
  parameters: {
    ...ArtworkBaseParameters;
    deadline?: string;
  };
}

model PackaArtworkRequestDesignSubmitted {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestDesignSubmitted";
  parameters: ArtworkBaseParameters;
}

model PackaArtworkRequestDesignRestarted {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestDesignRestarted";
  parameters: ArtworkBaseParameters;
}

model PackaArtworkRequestSoftproofHandover {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestSoftproofHandover";
  parameters: {
    ...ArtworkBaseParameters;
    deadline?: string;
  };
}

model PackaArtworkRequestSoftproofSubmitted {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestSoftproofSubmitted";
  parameters: ArtworkBaseParameters;
}

model PackaArtworkRequestSoftproofRestarted {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestSoftproofRestarted";
  parameters: ArtworkBaseParameters;
}

model PackaArtworkRequestApproved {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestApproved";
  parameters: ArtworkBaseParameters;
}

model PackaArtworkRequestCanceled {
  ...BaseNotificationFields;
  message: "PackaArtworkRequestCanceled";
  parameters: {
    ...ArtworkBaseParameters;
    approverName?: string;
    cancelationMessage?: string;
  };
}
