import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NorthstarLabs collects, uses, protects, and shares personal information.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <section className="legal-hero">
        <p className="sys-kicker">YOUR DATA, CLEARLY EXPLAINED</p>
        <h1>Privacy Policy</h1>
        <p>This policy explains what information NorthstarLabs processes when you create, sell, manage, or take learning products on the platform.</p>
      </section>
      <article className="legal-document">
        <p className="legal-updated">Effective and last updated: 21 July 2026</p>

        <section>
          <h2>1. Information we collect</h2>
          <p>We collect information you provide directly, including your name, email address, account profile, course content, community posts, learner records, support notes, portfolio projects and links, tutor profiles, tutoring enquiries, preferred contact method, and communications. We also process account activity such as enrolments, lesson progress, quiz results, private concept-mastery and practice records, certificates, portfolio visibility choices, and administrative actions.</p>
          <p>Technical information may include device and browser details, IP address, timestamps, security events, and diagnostic data needed to operate and protect the service.</p>
          <p>When you use the Demand Board, we keep your submitted name, email address, and detailed request private during moderation. If accepted, only the topic title and public summary are published. Voting uses a random browser identifier stored in a secure cookie and retained only as a one-way hash; it is not tied to a public profile. If you follow a topic, we store your email address and an unsubscribe token so we can send roadmap updates.</p>
        </section>

        <section>
          <h2>2. How we use information</h2>
          <ul>
            <li>Provide accounts, courses, communities, enrolments, analytics, and support features.</li>
            <li>Authenticate users, prevent abuse, investigate security incidents, and enforce platform rules.</li>
            <li>Process requested transactions and maintain financial and operational records.</li>
            <li>Improve reliability, accessibility, performance, and the user experience.</li>
            <li>Moderate Demand Board ideas, measure community interest, and notify followers when a topic moves through the roadmap.</li>
            <li>Meet legal obligations and protect the rights of NorthstarLabs, creators, and learners.</li>
          </ul>
        </section>

        <section>
          <h2>3. Creators and learner data</h2>
          <p>Creators control the learning products they publish and may view information about learners enrolled in their courses, including progress and completion activity. Creators must use that information only for legitimate learning, administration, and support purposes and must comply with applicable privacy laws.</p>
          <p>Private support notes are visible only within the relevant creator administration area and should not contain unnecessary sensitive information.</p>
          <p>The Personal Mastery Loop uses incorrect and later correct assessment answers to create a private revision queue, schedule follow-up checks, and record when a concept is mastered. These records are visible to the learner and are not added to a public portfolio or disclosed as public assessment evidence unless a separate feature clearly asks for the learnerâ€™s choice.</p>
          <p>Proof-of-learning portfolios are private by default. If a learner publishes a portfolio, the learnerâ€™s display name, portfolio introduction, and only the certificates, passed assessments, disclosed scores, projects, skills, feedback, and evidence links the learner deliberately marks visible become publicly accessible through the share link. Email addresses, private notes, quiz answers, failed attempts, and unselected evidence are not included. A learner can make the portfolio private again from the portfolio controls.</p>
          <p>When a learner sends a tutoring enquiry, the learner’s name, email address, optional phone number, requested subject, message, preferred times, selected appointment, and contact preference are shared with the selected tutor and the academy that published the profile. Private joining or venue details are shown to the learner only after the appointment is confirmed. Public phone, WhatsApp, or external booking links appear only when the academy enables direct contact for that tutor.</p>
        </section>

        <section>
          <h2>4. Service providers and sharing</h2>
          <p>We use service providers for hosting, authentication, storage, communications, analytics, and payment processing. They may process information only to provide their services to us and under appropriate confidentiality and security obligations.</p>
          <p>Google Analytics is loaded only after a visitor chooses to allow anonymous usage measurement on that device. We do not intentionally send lesson content, private notes, assessment answers, email addresses, or learner identifiers to Analytics. The device stores the visitor&apos;s choice so the question is not repeatedly shown.</p>
          <p>Academy owners may connect Zoom, Mailchimp, Zapier, or another supported service. Northstar sends information only for the feature or automation they enable. Mailchimp learner sync uses a pending subscription so the learner must confirm before marketing messages begin. Provider credentials are encrypted and are never included in academy exports.</p>
          <p>We may also disclose information when required by law, to protect people or the platform, in connection with a corporate transaction, or when you direct or consent to the disclosure. We do not sell personal information.</p>
          <p>If you call, message, or book with a tutor using an external phone, WhatsApp, calendar, or other service, that provider and the tutor process the information you share under their own privacy practices.</p>
        </section>

        <section>
          <h2>5. AI-assisted creation</h2>
          <p>When a creator deliberately uses Creator Studio, the instructions and selected source material needed for that request may be sent to the AI or media provider shown in the feature. We record project ownership, the source declaration, the provider and model used, generation status, and review or export actions so that the creator can understand how a draft was produced.</p>
          <p>Creators should minimise personal information in source packs and must not submit sensitive or confidential information unless it is necessary, lawful, and appropriately protected. Content involving children requires guardian authority and enhanced safeguarding. Provider processing may occur in another country under the transfer safeguards described below. Removing a Creator Studio project removes it from the active workspace, subject to security backups and legal retention requirements.</p>
          <h2>6. Course and learner migration</h2>
          <p>When a creator uses Migration Studio, we process the normalised course structure, source filenames, module order, media references, learner email addresses, and import decisions needed to create the preview and requested private drafts. Selected document files are stored in the academy media library only after the creator confirms the import. We retain an academy-scoped migration record so authorised staff can understand what was created and when.</p>
          <p>Creators should remove unnecessary personal information before uploading a learner list. Learners are not silently enrolled: the creator must explicitly choose whether to create secure invitations. Imported data remains separated by academy access controls and is included in platform backup and operational audit processes.</p>
          <h2>7. Complete academy exports</h2>
          <p>An academy owner or administrator can deliberately prepare a portable archive containing academy records and academy-owned original uploads. Depending on the academy&apos;s use of the platform, this can include learner names and email addresses, enrolment and progress records, assessment answers, private support notes, community content, coaching enquiries and ratings, communications, products, live-session records, and audit history.</p>
          <p>We exclude authentication credentials, active invitation links and token hashes, integration signing secrets, internal object-storage paths, and short-lived playback grants. A private, time-limited download link is created only on request. The completed archive is retained for seven days unless the authorised user removes it sooner; its limited audit record may remain for security and accountability.</p>
        </section>

        <section>
          <h2>8. International processing and retention</h2>
          <p>Information may be processed in countries other than where you live. Where required, we use appropriate safeguards for international transfers. We retain information for as long as needed to provide the service, meet legal or accounting requirements, resolve disputes, and enforce agreements. Retention periods vary by data type and account status.</p>
        </section>

        <section>
          <h2>9. Security</h2>
          <p>We use technical and organisational safeguards designed to protect information, including authenticated access, ownership checks, private file delivery, encryption in transit, and restricted administrative controls. No online service can guarantee absolute security, so users should choose strong passwords and protect their account access.</p>
        </section>

        <section>
          <h2>10. Your choices and rights</h2>
          <p>You can review and update core account information from Account settings. Depending on your location, you may have rights to access, correct, delete, restrict, or receive a copy of personal information, or to object to certain processing. Requests can be submitted through the support channel available in your account. We may need to verify your identity before completing a request.</p>
          <p>You can decline optional Analytics when the choice appears. You can reset the stored choice by clearing site data in your browser.</p>
        </section>

        <section>
          <h2>11. Children</h2>
          <p>NorthstarLabs is not directed to children under 13, and users must meet the minimum age required to consent to online services in their country. Creators and tutors offering learning to minors are responsible for obtaining required guardian permissions, applying appropriate safeguarding practices, and configuring communications and sessions appropriately.</p>
        </section>

        <section>
          <h2>12. Changes to this policy</h2>
          <p>We may update this policy as the service or applicable law changes. We will revise the date above and provide additional notice when a change materially affects user rights.</p>
        </section>
      </article>
    </>
  );
}
