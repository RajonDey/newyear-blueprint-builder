import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card safe-area-bottom">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Legal Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/refund"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Refund Policy
            </Link>
          </nav>

          <Separator className="w-full max-w-md" />

          {/* Copyright */}
          <div className="text-center text-sm text-muted-foreground">
            <p>© {currentYear} 2025 Success Blueprint. All rights reserved.</p>
            <p className="mt-1">Digital products delivered instantly.</p>
            <p className="mt-2">
              Need help? Contact us at{" "}
              <a 
                href="mailto:support@yourcompany.com" 
                className="text-primary hover:underline"
              >
                support@yourcompany.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
