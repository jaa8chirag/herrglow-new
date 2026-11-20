import type { Metadata } from "next";
import { Container, Section, SectionHeading } from "@herrglow/ui";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: "The terms that apply when you use the HerrGlow website to request makeup and beauty services at home.",
  path: "/terms",
});

// NOTE: starter terms. Have them reviewed by counsel before launch.
export default function TermsPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <SectionHeading as="h1" title="Terms of Service" />
        <div className="prose-herr">
          <p>By using this website you agree to these terms.</p>
          <h2>Our role</h2>
          <p>HerrGlow connects customers with independent makeup artists and beauticians. Prices shown are indicative and are confirmed before your booking is finalised.</p>
          <h2>Bookings</h2>
          <p>Submitting a form is a request, not a confirmed booking. A booking is confirmed when we or the assigned artist confirm the date, time, location and price with you.</p>
          <h2>Cancellations and rescheduling</h2>
          <p>Please inform us as early as possible if you need to change or cancel. Specific cancellation terms are shared at the time of confirmation.</p>
          <h2>Your responsibilities</h2>
          <p>Provide accurate details, a safe place to work, and tell the artist about any skin allergies or sensitivities before the service.</p>
          <h2>Liability</h2>
          <p>We take reasonable care in selecting artists but, to the extent permitted by law, are not liable for indirect losses arising from services delivered by independent artists.</p>
        </div>
      </Container>
    </Section>
  );
}
