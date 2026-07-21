import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of the NorthstarLabs learning platform.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <>
      <section className="legal-hero">
        <p className="sys-kicker">THE RULES OF THE PLATFORM</p>
        <h1>Terms of Service</h1>
        <p>These terms describe the responsibilities shared by NorthstarLabs, creators, administrators, and learners who use the platform.</p>
      </section>
      <article className="legal-document">
        <p className="legal-updated">Effective and last updated: 21 July 2026</p>

        <section>
          <h2>1. Accepting these terms</h2>
          <p>By creating an account, accessing a course, or otherwise using NorthstarLabs, you agree to these Terms of Service and acknowledge the <a href="/legal/privacy">Privacy Policy</a>. If you use NorthstarLabs for an organisation, you confirm that you are authorised to accept these terms for that organisation.</p>
        </section>

        <section>
          <h2>2. Accounts and eligibility</h2>
          <p>You must provide accurate account information, keep your credentials secure, and promptly notify us of suspected unauthorised access. You are responsible for activity performed through your account. You may not share access in a way that bypasses enrolment, plan, or administrative limits.</p>
        </section>

        <section>
          <h2>3. Creator responsibilities</h2>
          <p>Creators are responsible for their courses, communities, offers, learner communications, and any promises they make. Content must be accurate enough not to mislead learners and must comply with applicable consumer, advertising, accessibility, intellectual-property, and privacy laws.</p>
          <p>Creators may administer learners only within learning products they own. They must use learner information and private support notes for legitimate educational, operational, or support purposes.</p>
          <p>Academies that list tutors must have permission to publish each profile and must keep qualifications, experience, pricing, availability, contact information, and verification claims accurate. Academies and tutors remain responsible for safeguarding learners, delivering tutoring services, and complying with professional, consumer, tax, and child-protection requirements.</p>
        </section>

        <section>
          <h2>4. Learner responsibilities</h2>
          <p>Learners must participate respectfully, submit their own work where required, and avoid copying, redistributing, recording, or reselling protected course materials without permission. Certificates reflect completion against the configured course requirements and are not academic accreditation unless expressly stated by the creator.</p>
          <p>When contacting a tutor, learners must provide accurate enquiry information and use contact details responsibly. A requested appointment slot is temporarily reserved but is not confirmed until the tutor or academy accepts it. Learners may cancel a future request through their tutoring desk; the tutor&apos;s disclosed cancellation terms may still apply to late cancellations. Suitability and payment must be confirmed directly with the tutor unless NorthstarLabs expressly presents an integrated checkout.</p>
        </section>

        <section>
          <h2>5. Acceptable use</h2>
          <p>You may not use NorthstarLabs to break the law, infringe rights, harass others, distribute malware, probe or bypass security, interfere with service operation, scrape protected areas, impersonate another person, or publish unlawful, deceptive, hateful, or exploitative material.</p>
          <p>Demand Board submissions and votes are signals, not purchases, contracts, or promises that NorthstarLabs will create a course or service. We may moderate, edit for clarity, merge duplicates, hide, decline, or reclassify submissions. Roadmap labels describe current intent and may change as feasibility, rights, safety, demand, and available expertise are assessed.</p>
        </section>

        <section>
          <h2>6. Content ownership and licence</h2>
          <p>You retain ownership of content you submit. You grant NorthstarLabs a limited, worldwide licence to host, process, reproduce, and display that content only as needed to operate, secure, improve, and provide the service. You confirm that you have the rights needed to upload and use your content.</p>
          <p>NorthstarLabs and its licensors retain all rights in the platform, brand, software, designs, and documentation. These terms do not transfer ownership of the platform to you.</p>
        </section>

        <section>
          <h2>7. Plans, payments, and refunds</h2>
          <p>Paid features, billing frequency, taxes, processing charges, renewal terms, and cancellation options will be shown before purchase. Unless a specific offer says otherwise, access continues through the paid period after cancellation. Refund rights are governed by the applicable offer, creator policy, and mandatory consumer law. Payment activation remains subject to the final checkout configuration.</p>
          <p>The tutor directory facilitates introductions, appointment requests, confirmations, and cancellations. NorthstarLabs does not collect or hold payment for independently arranged tutoring sessions unless a future checkout expressly states otherwise. Tutors are responsible for disclosing their own pricing, payment, cancellation, and refund terms before a session is confirmed.</p>
        </section>

        <section>
          <h2>8. Creator Studio and AI-assisted content</h2>
          <p>Creator Studio can help transform creator-supplied source material into draft course structures, lessons, assessments, narration, and other media. Creators must have the ownership, licence, permission, or other lawful basis needed for every source they submit. They must not upload confidential information, personal information, protected works, voices, or likenesses unless they are authorised to use them for this purpose.</p>
          <p>AI-generated material is a draft, not a verified publication. The creator remains responsible for checking accuracy, citations, accessibility, safety, rights, and suitability before publishing. Creators must make meaningful AI involvement clear where a learner could otherwise reasonably believe that material was produced or delivered entirely by a person. Generated material may not be presented as professional medical, legal, financial, or other regulated advice, or as accredited learning, unless those claims are independently valid.</p>
          <h2>9. Course and learner migration</h2>
          <p>Migration Studio can interpret creator-supplied course exports, curriculum outlines, ordered documents, media manifests, and learner lists. Creators must own the material or have a lawful licence, permission, or other authority to migrate it. They are responsible for checking the preview, course order, assessment answers, media rights, learner-email accuracy, and the lawful basis for contacting imported learners.</p>
          <p>Imported courses are created as private drafts and are not automatically published. Existing courses are not intentionally overwritten. A creator who explicitly chooses to create learner invitations authorises NorthstarLabs to generate secure, expiring invitations for the supplied addresses.</p>
          <p>Selected AI and media providers may process submitted instructions and source material to perform the requested generation. Their availability and acceptable-use rules may affect the feature. NorthstarLabs records the provider and model used where practical so that creators can review the provenance of a draft.</p>
          <h2>10. Freedom Guarantee and academy exports</h2>
          <p>Academy owners and administrators may prepare a self-service portable archive of academy content and records at no charge. The archive is intended to include structured teaching, learner, business, community, coaching, assessment and operational records together with academy-owned original uploads. It is provided in commonly readable formats, but another provider may require field mapping because platform schemas differ.</p>
          <p>For security, an export does not include passwords, authentication credentials, active invitation links or token hashes, integration signing secrets, internal object-storage paths, or short-lived playback grants. Exports can contain personal and confidential information. The person creating or downloading one must store it securely, restrict access, and handle it in accordance with applicable privacy law.</p>
          <p>Completed archives are retained temporarily for download and then removed. A fresh archive can be prepared while the academy account remains accessible. The Freedom Guarantee does not require NorthstarLabs to transfer a creator&apos;s data directly into another provider&apos;s proprietary system or to provide content owned by NorthstarLabs or another licensor.</p>
        </section>

        <section>
          <h2>11. Suspension and termination</h2>
          <p>You may stop using the service at any time. We may restrict or suspend access when reasonably necessary to address security risk, non-payment, unlawful activity, material breach, or harm to the platform or its users. Where practical, we will provide notice and an opportunity to resolve the issue.</p>
        </section>

        <section>
          <h2>12. Service availability and disclaimers</h2>
          <p>We work to provide a reliable service but cannot promise uninterrupted or error-free operation. Features may evolve, and third-party services may affect availability. To the fullest extent permitted by law, the service is provided without implied warranties beyond those that cannot legally be excluded.</p>
        </section>

        <section>
          <h2>13. Liability</h2>
          <p>Nothing in these terms excludes liability that cannot lawfully be limited. To the extent permitted by law, NorthstarLabs is not responsible for indirect or consequential loss, lost profits, lost opportunity, creator-provided content, or independently delivered tutoring services and arrangements. Any aggregate liability will be limited to the amount paid for the service during the twelve months before the event giving rise to the claim.</p>
        </section>

        <section>
          <h2>14. Changes and contact</h2>
          <p>We may update these terms to reflect service, legal, or security changes. We will revise the date above and provide additional notice for material changes. Questions or formal requests can be submitted through the support channel available in your account.</p>
        </section>
      </article>
    </>
  );
}
