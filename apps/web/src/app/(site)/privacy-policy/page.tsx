import type { Metadata } from "next";
import { Container, Section, SectionHeading } from "@herrglow/ui";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How HerrGlow collects, uses and protects the personal information you share when you book or enquire.",
  path: "/privacy-policy",
});

// NOTE: starter policy text. Have it reviewed by counsel before launch.
export default function PrivacyPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <SectionHeading as="h1" title="Privacy Policy" />
        <div className="prose-herr">
          <p>This policy explains what personal information HerrGlow collects when you use our website, and how we use it.</p>
          <h2>Information we collect</h2>
          <p>When you send a booking request or enquiry we collect your name, mobile number, optional email, city and area, preferred date and any message you write. We also record the page you submitted the form from.</p>
          <h2>How we use it</h2>
          <p>We use your details to contact you about your request, match you with an artist who covers your area, and confirm your booking. If you are outside our current service area, we keep your request so we can tell you when we expand.</p>
          <h2>Sharing</h2>
          <p>We share your name, contact number and service location with the artist assigned to your booking so they can serve you. We do not sell your personal information. Artists&apos; own phone numbers and addresses are never published on this website.</p>
          <h2>Retention and your choices</h2>
          <p>We keep booking records for as long as needed to provide the service and meet legal obligations. You can ask us to correct or delete your information by contacting us through the contact page.</p>
          <h2>Changes</h2>
          <p>We may update this policy and will post the latest version on this page.</p>
        </div>
      </Container>
    </Section>
  );
}
