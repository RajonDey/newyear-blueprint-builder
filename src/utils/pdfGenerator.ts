/**
 * Main PDF Generator - Abstraction Layer
 *
 * This file provides a unified interface for PDF generation,
 * allowing seamless switching between jsPDF and React-PDF implementations
 * via environment variable configuration.
 *
 * To switch between implementations, set VITE_USE_REACT_PDF=true/false
 */

import { APP_CONFIG } from "@/lib/config";
import { CategoryGoal, LifeCategory } from "@/types/wizard";
import { logger } from "@/lib/logger";

// PDF Data Interface (shared by both implementations)
export interface PDFData {
  userName: string;
  userEmail: string;
  goals: CategoryGoal[];
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
  lifeWheelRatings: Record<LifeCategory, number>;
}

// Import both implementations
import { generateSuccessPDF_jsPDF } from "./pdfGenerator.jspdf";
import { generateSuccessPDF_React } from "./pdfGenerator.react";

/**
 * Main PDF generation function
 *
 * Uses feature flag to determine which implementation to use:
 * - jsPDF (default): Fast, proven, good quality
 * - React-PDF (optional): Premium quality, React components
 *
 * @param data - PDF generation data
 * @returns PDF generation result
 */
export const generateSuccessPDF = (data: PDFData) => {
  // Feature flag check
  const useReactPDF = APP_CONFIG.pdf.useReactPDF;

  if (useReactPDF) {
    logger.info("🎨 Using React-PDF for premium PDF generation");
    return generateSuccessPDF_React(data);
  }

  // Default: Use jsPDF (current stable implementation)
  logger.info("📄 Using jsPDF for PDF generation");
  return generateSuccessPDF_jsPDF(data);
};
