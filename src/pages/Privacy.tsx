import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

const Privacy = () => {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: November 24, 2025</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                At 2025 Success Blueprint, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, and protect your personal information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">2.1 Information You Provide</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Name:</strong> Used for personalization in your PDF</li>
                    <li><strong className="text-foreground">Email Address:</strong> Required for PDF delivery and payment receipt</li>
                    <li><strong className="text-foreground">Goal Content:</strong> The goals, actions, habits, and motivations you enter</li>
                    <li><strong className="text-foreground">Category Selections:</strong> Your chosen life categories and priorities</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">2.2 Automatically Collected Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Browser Data:</strong> Your progress is stored locally in your browser using localStorage</li>
                    <li><strong className="text-foreground">Payment Information:</strong> Processed securely by Lemon Squeezy (we never see your card details)</li>
                    <li><strong className="text-foreground">Usage Analytics:</strong> Basic analytics to improve our service (anonymous)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Generate your personalized success blueprint PDF</li>
                <li>Send your purchased PDF to your email address</li>
                <li>Process your payment through Lemon Squeezy</li>
                <li>Provide customer support if needed</li>
                <li>Send payment receipts and order confirmations</li>
                <li>Improve our service through anonymous usage data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">4.1 Local Storage:</strong> Your planning content is stored locally in your 
                  browser's localStorage. This data never leaves your device until you complete your purchase.
                </p>
                <p>
                  <strong className="text-foreground">4.2 Server Storage:</strong> After purchase, we temporarily store your data 
                  to generate and deliver your PDF. This data is retained only as long as necessary for service delivery.
                </p>
                <p>
                  <strong className="text-foreground">4.3 Security Measures:</strong> We use industry-standard security practices 
                  to protect your information, including encryption for data transmission.
                </p>
                <p>
                  <strong className="text-foreground">4.4 Payment Security:</strong> All payment processing is handled by Lemon Squeezy, 
                  a PCI-compliant payment processor. We never store your payment card information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">5.1 Lemon Squeezy:</strong> We use Lemon Squeezy for payment processing and 
                  PDF delivery. They have their own privacy policy governing their handling of your data.
                </p>
                <p>
                  <strong className="text-foreground">5.2 Analytics:</strong> We may use privacy-focused analytics tools to understand 
                  how users interact with our service (no personal identification).
                </p>
                <p>
                  <strong className="text-foreground">5.3 Hosting:</strong> Our service is hosted on secure cloud infrastructure 
                  that complies with industry security standards.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Sharing and Disclosure</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">We do not sell your personal information.</strong> We only share your data in 
                  the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>With Lemon Squeezy for payment processing and PDF delivery</li>
                  <li>When required by law or legal process</li>
                  <li>To protect our rights or the safety of others</li>
                  <li>With your explicit consent</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">7.1 Access:</strong> You can request access to the personal information we hold about you.
                </p>
                <p>
                  <strong className="text-foreground">7.2 Deletion:</strong> You can request deletion of your personal information 
                  (subject to legal retention requirements).
                </p>
                <p>
                  <strong className="text-foreground">7.3 Correction:</strong> You can request correction of inaccurate information.
                </p>
                <p>
                  <strong className="text-foreground">7.4 Browser Data:</strong> You can clear your browser's localStorage at any time 
                  to remove locally saved progress.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Transaction Data:</strong> We retain order and payment information for accounting 
                  and legal purposes (typically 7 years).
                </p>
                <p>
                  <strong className="text-foreground">Planning Content:</strong> Your goals and planning data used to generate your PDF 
                  are not permanently stored on our servers after delivery.
                </p>
                <p>
                  <strong className="text-foreground">Email Communications:</strong> Order confirmations and PDF delivery emails are 
                  retained as part of normal business operations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use minimal cookies and tracking technologies. Essential cookies are required for the service to function 
                (like remembering your progress). We may use analytics cookies to improve the service, but these do not identify 
                you personally.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. International Users</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are accessing our service from outside the United States, please be aware that your information may be 
                transferred to, stored, and processed in the United States where our servers are located.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal 
                information from children. If you believe we have collected information from a minor, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated 
                "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy or want to exercise your privacy rights, please contact us 
                through the support email provided on our website.
              </p>
            </section>

            <section className="bg-muted/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-semibold mb-4">Privacy at a Glance</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>We collect your name, email, and goal content</li>
                <li>Your data is stored locally in your browser until purchase</li>
                <li>We never sell your information</li>
                <li>Payment details are handled securely by Lemon Squeezy</li>
                <li>You can request deletion of your data at any time</li>
                <li>We use minimal cookies and tracking</li>
              </ul>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
