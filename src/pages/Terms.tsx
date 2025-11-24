import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

const Terms = () => {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last Updated: November 24, 2025</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the 2025 Success Blueprint service, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, you may not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                2025 Success Blueprint is a digital planning tool that helps you create personalized goal-setting 
                frameworks and action plans. Upon completion and payment, you receive a premium PDF document containing 
                your customized success blueprint.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Purchase and Payment</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">3.1 Digital Product:</strong> The 2025 Success Blueprint is a digital product 
                  delivered instantly as a PDF file after successful payment.
                </p>
                <p>
                  <strong className="text-foreground">3.2 Pricing:</strong> All prices are displayed in USD and are subject to change. 
                  The price you pay at checkout is final.
                </p>
                <p>
                  <strong className="text-foreground">3.3 Payment Processing:</strong> Payments are processed securely through Lemon Squeezy. 
                  We do not store your payment information.
                </p>
                <p>
                  <strong className="text-foreground">3.4 Instant Delivery:</strong> Your PDF will be available for download immediately 
                  after payment confirmation. A copy will also be sent to your email address.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. License and Usage</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">4.1 Personal Use License:</strong> You are granted a non-exclusive, 
                  non-transferable license to use the PDF for personal planning purposes only.
                </p>
                <p>
                  <strong className="text-foreground">4.2 Prohibited Uses:</strong> You may not redistribute, resell, or share 
                  the PDF with others. You may not use the content for commercial purposes without written permission.
                </p>
                <p>
                  <strong className="text-foreground">4.3 Backup Copies:</strong> You may make backup copies for personal use only.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, design, graphics, and compilation of the 2025 Success Blueprint service and PDF are owned by us 
                and protected by copyright laws. Your personalized content remains yours, but the template and framework are 
                our intellectual property.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. User Responsibilities</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">6.1 Account Information:</strong> You are responsible for providing accurate 
                  information, including your email address for delivery.
                </p>
                <p>
                  <strong className="text-foreground">6.2 Content You Create:</strong> You are responsible for the goals, actions, 
                  and content you input into the service.
                </p>
                <p>
                  <strong className="text-foreground">6.3 Browser Storage:</strong> Your progress is saved locally in your browser. 
                  Clearing browser data may result in loss of unsaved progress.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We offer a 14-day money-back guarantee. See our{" "}
                <Link to="/refund" className="text-primary hover:underline">
                  Refund Policy
                </Link>{" "}
                for complete details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">8.1 No Guarantee of Results:</strong> The 2025 Success Blueprint is a 
                  planning tool. We make no guarantees about achieving your goals or specific outcomes.
                </p>
                <p>
                  <strong className="text-foreground">8.2 "As Is" Basis:</strong> The service is provided "as is" without 
                  warranties of any kind, express or implied.
                </p>
                <p>
                  <strong className="text-foreground">8.3 Not Professional Advice:</strong> This tool does not provide 
                  professional, financial, legal, or therapeutic advice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Technical Requirements</h2>
              <p className="text-muted-foreground leading-relaxed">
                You need a modern web browser with JavaScript enabled and a PDF reader to view your final document. 
                We recommend the latest version of Chrome, Firefox, Safari, or Edge.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                Your continued use of the service constitutes acceptance of revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us through the support email provided on our website.
              </p>
            </section>

            <section className="bg-muted/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4">Quick Summary</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You're buying a digital PDF planning tool for personal use</li>
                <li>No refunds after 14 days</li>
                <li>Don't share or resell the PDF</li>
                <li>We're not responsible for your goal outcomes</li>
                <li>Your progress is saved in your browser</li>
              </ul>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
