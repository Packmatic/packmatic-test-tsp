import "@typespec/http";
import "@typespec/openapi";

import "./errors.tsp";
import "./base.tsp";
import "./misc.tsp";
import "./trading.tsp";
import "./comments.tsp";
import "./projects.tsp";
import "./artwork.tsp";
import "./qualifications.tsp";
import "./dealroom.tsp";
import "./supplier-tasks.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{ title: "Notifications" })
namespace Notifications;

// ─── Notification body union ────────────────────────────────────

/** Union of all notification types, discriminated by `message` property. */
@discriminated(#{ discriminatorPropertyName: "message", envelope: "none" })
union NotificationBody {
  // misc
  Generic: Generic,

  // trading
  OfferFeedback: OfferFeedback,

  QuotationSubmitted: QuotationSubmitted,
  QuotationRevised: QuotationRevised,
  OfferHandover: OfferHandover,
  NewSupplierPriceUpdateRequest: NewSupplierPriceUpdateRequest,
  NewRevisionRequired: NewRevisionRequired,
  PriceUpdateReviewedByPackmatic: PriceUpdateReviewedByPackmatic,
  PriceUpdateHandover: PriceUpdateHandover,

  // comments
  NewSpecComment: NewSpecComment,

  NewOfferComment: NewOfferComment,
  NewQualificationComment: NewQualificationComment,
  NewDealroomComment: NewDealroomComment,
  NewSupplierTaskComment: NewSupplierTaskComment,
  NewPriceUpdateComment: NewPriceUpdateComment,

  // projects
  NewProjectAssignmentSupplierOnboarded: NewProjectAssignmentSupplierOnboarded,

  UpdatedProjectAssignmentSupplierOnboarded: UpdatedProjectAssignmentSupplierOnboarded,
  NewProjectAssignmentSupplierNotOnboarded: NewProjectAssignmentSupplierNotOnboarded,
  UpdatedProjectAssignmentSupplierNotOnboarded: UpdatedProjectAssignmentSupplierNotOnboarded,
  ProjectAssignmentDeadlineReminder: ProjectAssignmentDeadlineReminder,
  ProjectResultsSupplier: ProjectResultsSupplier,
  CRPOutcomeSubmitted: CRPOutcomeSubmitted,

  // artwork
  PackaArtworkRequestCreated: PackaArtworkRequestCreated,

  PackaArtworkRequestAllRequirementsSubmitted: PackaArtworkRequestAllRequirementsSubmitted,
  PackaArtworkRequestRequirementsRestarted: PackaArtworkRequestRequirementsRestarted,
  PackaArtworkRequestDesignHandover: PackaArtworkRequestDesignHandover,
  PackaArtworkRequestDesignSubmitted: PackaArtworkRequestDesignSubmitted,
  PackaArtworkRequestDesignRestarted: PackaArtworkRequestDesignRestarted,
  PackaArtworkRequestSoftproofHandover: PackaArtworkRequestSoftproofHandover,
  PackaArtworkRequestSoftproofSubmitted: PackaArtworkRequestSoftproofSubmitted,
  PackaArtworkRequestSoftproofRestarted: PackaArtworkRequestSoftproofRestarted,
  PackaArtworkRequestApproved: PackaArtworkRequestApproved,
  PackaArtworkRequestCanceled: PackaArtworkRequestCanceled,

  // qualifications
  NewQualificationCreated: NewQualificationCreated,

  QualificationPreparationCompleted: QualificationPreparationCompleted,
  QualificationSamplingCompleted: QualificationSamplingCompleted,
  QualificationIndustrialTestCompleted: QualificationIndustrialTestCompleted,
  QualificationMarkedAsQualified: QualificationMarkedAsQualified,
  QualificationCanceled: QualificationCanceled,
  InitiateQualificationPriceUpdate: InitiateQualificationPriceUpdate,

  // dealroom
  DealroomDocumentUploadRequested: DealroomDocumentUploadRequested,

  DealroomDocumentRevisionRequested: DealroomDocumentRevisionRequested,
  DealroomAdditionalDocumentRequested: DealroomAdditionalDocumentRequested,
  DealroomTenderResultsReady: DealroomTenderResultsReady,
  DealroomCustomerReviewRequested: DealroomCustomerReviewRequested,
  DealroomInternalCustomerSubmittedDocuments: DealroomInternalCustomerSubmittedDocuments,
  DealroomInternalCustomerSubmittedRevisions: DealroomInternalCustomerSubmittedRevisions,
  DealroomInternalCustomerUploadedNewlyRequestedDocument: DealroomInternalCustomerUploadedNewlyRequestedDocument,
  DealroomExternalNotificationWasSent: DealroomExternalNotificationWasSent,
  PackaPortalCustomerLogin: PackaPortalCustomerLogin,

  // supplier tasks
  NewSupplierTaskAssignedToSupplier: NewSupplierTaskAssignedToSupplier,

  SupplierTaskDueSoon: SupplierTaskDueSoon,
  SupplierTaskOverdue: SupplierTaskOverdue,
  FollowUpSupplierTask: FollowUpSupplierTask,
  SupplierTaskCompletedBySupplier: SupplierTaskCompletedBySupplier,
  SupplierTaskCancelled: SupplierTaskCancelled,

  // misc (cont.)
  PackaUserCreated: PackaUserCreated,

  PackaFrameworkCheckBooked: PackaFrameworkCheckBooked,
  PackaSpecificationRequestCreated: PackaSpecificationRequestCreated,
  PackaSpecificationRequestMessageSent: PackaSpecificationRequestMessageSent,
  PackaDocumentRequestSupplier: PackaDocumentRequestSupplier,
}

// ─── API ─────────────────────────────────────────────────────────

@route("/{tenant}/v1/notifications")
@operationId("createNotification")
@post
op create(@path tenant: string, @body notification: NotificationBody):
  | {
      @statusCode statusCode: 202;
      @header location: string;
    }
  | BadRequest
  | Unauthorized
  | Forbidden
  | ServerError;

@discriminator("kind")
model Pet {
  name: string;
  weight?: float32;
}
model Cat extends Pet {
  kind: "cat";
  meow: int32;
}
model Dog extends Pet {
  kind: "dog";
  bark: string;
}

@route("/pets")
@get
op getPet(): Pet[] | BadRequest | Unauthorized | Forbidden | ServerError;

