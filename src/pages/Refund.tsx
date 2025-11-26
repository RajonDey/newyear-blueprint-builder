import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_CONFIG } from "@/lib/config";

const Refund = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Refund Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last Updated: December 1, 2025
          </p>

          <Alert className="mb-8 bg-success/10 border-success/20">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <AlertDescription className="text-foreground">
              <strong>14-Day Money-Back Guarantee</strong>
              <br />
              We stand behind the quality of our product. If you're not
              satisfied, we'll refund your purchase within 14 days—no questions
              asked.
            </AlertDescription>
          </Alert>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Our Commitment</h2>
              <p className="text-muted-foreground leading-relaxed">
                We want you to be completely satisfied with your{" "}
                {APP_CONFIG.year} Success Blueprint. If for any reason you're
                not happy with your purchase, we offer a straightforward refund
                policy to ensure you can buy with confidence.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Refund Eligibility
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">
                    You are eligible for a full refund if:
                  </strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You request a refund within 14 days of purchase</li>
                  <li>You have a valid order receipt or transaction ID</li>
                  <li>The refund is requested by the original purchaser</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. How to Request a Refund
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Requesting a refund is simple and hassle-free:</p>
                <ol className="list-decimal list-inside space-y-3 ml-4">
                  <li>
                    <strong className="text-foreground">
                      Contact Support:
                    </strong>{" "}
                    Send an email to our support address (provided in your order
                    confirmation) with your order details
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Include Your Order Number:
                    </strong>{" "}
                    Provide your transaction ID or order number from your
                    purchase receipt
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Optional Feedback:
                    </strong>{" "}
                    While not required, we'd appreciate knowing how we can
                    improve (but this won't affect your refund)
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Receive Confirmation:
                    </strong>{" "}
                    We'll process your refund within 2-3 business days and send
                    you a confirmation email
                  </li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Refund Processing Time
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Processing Time:</strong>{" "}
                  Once approved, refunds are processed within 2-3 business days.
                </p>
                <p>
                  <strong className="text-foreground">
                    Return to Your Account:
                  </strong>{" "}
                  Depending on your payment method and financial institution, it
                  may take an additional 5-10 business days for the funds to
                  appear in your account.
                </p>
                <p>
                  <strong className="text-foreground">Refund Method:</strong>{" "}
                  Refunds are issued to the original payment method used for
                  purchase.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. After the 14-Day Period
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Standard Policy:</strong>{" "}
                  After 14 days from purchase, refunds are generally not
                  available as this is a digital product delivered instantly.
                </p>
                <p>
                  <strong className="text-foreground">
                    Exceptional Circumstances:
                  </strong>{" "}
                  If you believe you have an exceptional case (technical issues
                  preventing PDF access, duplicate purchase, etc.), please
                  contact us. We'll review your situation on a case-by-case
                  basis.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Technical Issues
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">PDF Not Received:</strong>{" "}
                  If you didn't receive your PDF after purchase, please contact
                  support immediately. We'll resend it right away—no refund
                  necessary!
                </p>
                <p>
                  <strong className="text-foreground">
                    Download Problems:
                  </strong>{" "}
                  Having trouble accessing or downloading your PDF? We'll help
                  you resolve the issue first before considering a refund.
                </p>
                <p>
                  <strong className="text-foreground">Corrupted File:</strong>{" "}
                  If your PDF file is corrupted or unreadable, we'll generate
                  and send you a new copy immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Duplicate Purchases
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you accidentally made a duplicate purchase, please contact us
                immediately with both transaction IDs. We'll refund the
                duplicate charge in full, regardless of the 14-day window.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. What Happens After a Refund
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">You Keep the PDF:</strong>{" "}
                  We trust you. If you receive a refund, you can keep the PDF
                  file you downloaded. We believe in our product and hope you'll
                  find it valuable even if it wasn't what you expected right
                  now.
                </p>
                <p>
                  <strong className="text-foreground">Future Purchases:</strong>{" "}
                  Receiving a refund does not prevent you from purchasing again
                  in the future if you change your mind.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                9. Fraudulent Refund Requests
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                While we offer a generous refund policy, we reserve the right to
                deny refund requests that appear fraudulent or abusive (e.g.,
                repeated purchases and refund requests). We also reserve the
                right to refuse service to customers who abuse our refund
                policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Chargebacks</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">
                    Please Contact Us First:
                  </strong>{" "}
                  If you're considering a chargeback, please reach out to us
                  first. We're happy to issue a refund directly, which is faster
                  and easier for both of us.
                </p>
                <p>
                  <strong className="text-foreground">
                    Chargeback Consequences:
                  </strong>{" "}
                  Chargebacks result in additional fees for us and may result in
                  your account being blocked from future purchases.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                11. Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To request a refund or if you have questions about this policy,
                please contact us through the support email provided in your
                order confirmation. We typically respond within 24 hours during
                business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                12. Policy Changes
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify this Refund Policy at any time.
                Changes will not affect purchases made prior to the policy
                update. The "Last Updated" date at the top of this page
                indicates when the policy was last revised.
              </p>
            </section>

            <section className="bg-muted/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4">
                Refund Policy Summary
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    ✅ Eligible for Refund:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Within 14 days of purchase</li>
                    <li>Any reason, no questions asked</li>
                    <li>Technical issues (anytime)</li>
                    <li>Duplicate purchases</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    ⏱️ Processing Time:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>2-3 business days to process</li>
                    <li>5-10 days to reach your account</li>
                    <li>Refunded to original payment method</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-primary/5 p-6 rounded-lg border border-primary/20 mt-8">
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Our Promise to You
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We're confident you'll love your {APP_CONFIG.year} Success
                Blueprint. But if it's not the right fit, we want you to feel
                comfortable requesting a refund. No hassle, no hard feelings.
                Your satisfaction and trust matter more to us than a single
                sale.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Refund;
