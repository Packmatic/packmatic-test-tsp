namespace Notifications;

/** Uniform Resource Name (e.g. `urn:pm:service::foobar/d9a6fc2e-...`) */
@pattern("^urn:[\\w-]+:[\\w.-]*:[\\w.-]*:[\\w-]+/[^/]+")
scalar urn extends string;

// ─── Base notification fields (shared across all types) ──────────

model BaseNotificationFields {
  /** Can be a URN (user/role) or email address */
  recipients: string[];

  /** Optional reply-to URN or email */
  replyTo?: string;

  /** Optional sender URN for display name */
  from?: urn;

  /** CTA link URL */
  link?: string;

  /** Locale for template rendering (e.g. "en-us") */
  locale?: string;
}
