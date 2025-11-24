import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card/80 backdrop-blur-sm safe-area-bottom">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          {/* Legal Links */}
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              to="/refund"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Refund Policy
            </Link>
          </nav>

          <Separator className="w-full max-w-md opacity-50" />

          {/* Copyright */}
          <div className="text-center text-xs md:text-sm text-muted-foreground space-y-1">
            <p>© {currentYear} Success Blueprint. All rights reserved.</p>
            <p className="opacity-75">Digital products delivered instantly.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
