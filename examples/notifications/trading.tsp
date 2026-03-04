namespace Notifications;

// ─── Offer Feedback ─────────────────────────────────────────────

model OfferFeedback {
  ...BaseNotificationFields;
  message: "OfferFeedback";
  parameters: {
    feedback: string;
    supplierId: string;
    requestId: string;
    packmaticId: string;
  };
}

// ─── Quotation ──────────────────────────────────────────────────

model QuotationSubmittedParameters {
  quotationLink: string;
  supplierName: string;
  customerName: string;
  deadline?: string;
  dueDate?: string;
  internalPriority?: string;
  supplierPriority?: string;
  priceUpdateTitle: string;
  packmaticProjectIds: string[];
  lineItemsCount: int32;
}

model QuotationSubmitted {
  ...BaseNotificationFields;
  message: "QuotationSubmitted";
  parameters: QuotationSubmittedParameters;
}

model QuotationRevised {
  ...BaseNotificationFields;
  message: "QuotationRevised";
  parameters: QuotationSubmittedParameters;
}

// ─── Offer Handover ─────────────────────────────────────────────

model OfferHandover {
  ...BaseNotificationFields;
  message: "OfferHandover";
  parameters: {
    offer: {
      title: string;
      state: string;
      validUntil?: string;
    };
    customer: {
      name: string;
    };
  };
}

// ─── Price Update ───────────────────────────────────────────────

model SupplierPriceUpdateParameters {
  customerName: string;
  dueDate: string;
  priority: string;
  projectIds: string[];
  lineItemCount: int32;
}

model NewSupplierPriceUpdateRequest {
  ...BaseNotificationFields;
  message: "NewSupplierPriceUpdateRequest";
  parameters: SupplierPriceUpdateParameters;
}

model NewRevisionRequired {
  ...BaseNotificationFields;
  message: "NewRevisionRequired";
  parameters: SupplierPriceUpdateParameters;
}

model PriceUpdateReviewedByPackmatic {
  ...BaseNotificationFields;
  message: "PriceUpdateReviewedByPackmatic";
  parameters: SupplierPriceUpdateParameters;
}

model PriceUpdateHandover {
  ...BaseNotificationFields;
  message: "PriceUpdateHandover";
  parameters: {
    priceUpdate: {
      title: string;
      state: string;
      dueAt?: string;
    };
    customer: {
      name: string;
    };
  };
}
