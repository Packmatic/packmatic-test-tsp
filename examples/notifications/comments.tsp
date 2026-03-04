namespace Notifications;

// ─── Shared comment info ────────────────────────────────────────

model CommentInfo {
  body: string;
  createdAt: utcDateTime;
  createdBy: string;
}

// ─── Spec Comment ───────────────────────────────────────────────

model NewSpecComment {
  ...BaseNotificationFields;
  message: "NewSpecComment";
  parameters: {
    comment: CommentInfo;
    spec: {
      title: string;
      packagingType: string;
      projectPackmaticId?: string;
    };
    customer: {
      name: string;
    };
  };
}

// ─── Offer Comment ──────────────────────────────────────────────

model NewOfferComment {
  ...BaseNotificationFields;
  message: "NewOfferComment";
  parameters: {
    comment: CommentInfo;
    offer: {
      title: string;
      state: string;
      keyAccountManager: string;
      validUntil?: string;
    };
    customer: {
      name: string;
    };
  };
}

// ─── Qualification Comment ──────────────────────────────────────

model NewQualificationComment {
  ...BaseNotificationFields;
  message: "NewQualificationComment";
  parameters: {
    comment: CommentInfo;
    qualification: {
      state: string;
      keyAccountManager: string;
      packagingLead: string;
      buyingLead?: string;
      customer: string;
      projectPackmaticId: string;
    };
    spec: {
      title: string;
    };
  };
}

// ─── Dealroom Comment ───────────────────────────────────────────

model NewDealroomComment {
  ...BaseNotificationFields;
  message: "NewDealroomComment";
  parameters: {
    comment: CommentInfo;
    dealroom: {
      id: string;
      title?: string;
      state: string;
      keyAccountManager: string;
      customer: string;
    };
  };
}

// ─── Supplier Task Comment ──────────────────────────────────────

model NewSupplierTaskComment {
  ...BaseNotificationFields;
  message: "NewSupplierTaskComment";
  parameters: {
    comment: {
      ...CommentInfo;
      fileCount: int32;
    };
    task: {
      title: string;
    };
  };
}

// ─── Price Update Comment ───────────────────────────────────────

model NewPriceUpdateComment {
  ...BaseNotificationFields;
  message: "NewPriceUpdateComment";
  parameters: {
    comment: CommentInfo;
    priceUpdate: {
      title: string;
      state: string;
      keyAccountManager: string;
      estimatedOfferValue?: float64;
      estimatedMargin?: float64;
      estimatedGrossProfit?: float64;
      dueAt?: string;
    };
    customer: {
      name: string;
    };
  };
}
