import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CategoryGoal, LifeCategory } from "@/types/wizard";
import { APP_CONFIG } from "@/lib/config";
import { logger } from "@/lib/logger";

interface PDFData {
  userName: string;
  userEmail: string;
  goals: CategoryGoal[];
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
}

export const generateSuccessPDF_jsPDF = (data: PDFData) => {
  try {
    // Validate input data
    if (!data.userName || !data.userEmail) {
      throw new Error("Missing required user information (name or email)");
    }

    if (!data.goals || data.goals.length === 0) {
      throw new Error("No goals to generate PDF");
    }

    if (!data.primaryCategory) {
      throw new Error("Primary category is required");
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 28; // Increased for premium feel

    // Helper for centered text
    const centerText = (
      text: string,
      y: number,
      size: number = 12,
      font: string = "helvetica",
      style: string = "normal",
      color: [number, number, number] = [0, 0, 0]
    ) => {
      doc.setFontSize(size);
      doc.setFont(font, style);
      doc.setTextColor(...color);
      doc.text(text, pageWidth / 2, y, { align: "center" });
    };

    // Helper for adding footer
    const addFooter = (pageNumber: number) => {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Your ${APP_CONFIG.year} Success Blueprint • Page ${pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    };

    // --- COVER PAGE ---
    // Background accent
    doc.setFillColor(245, 247, 255); // Very light indigo
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Top Accent Bar
    doc.setFillColor(99, 102, 241); // Indigo-500
    doc.rect(0, 0, pageWidth, 15, "F");

    // Title Section with better spacing
    let y = 90; // More top spacing
    centerText(
      `${APP_CONFIG.year}`,
      y,
      85,
      "helvetica",
      "bold",
      [99, 102, 241]
    );

    y += 30; // Increased spacing
    centerText("SUCCESS BLUEPRINT", y, 32, "helvetica", "bold", [30, 41, 59]);

    y += 18; // Better spacing
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1.5); // Slightly thicker line
    doc.line(margin + 50, y, pageWidth - margin - 50, y); // Shorter line for elegance

    y += 25; // More breathing room
    centerText(
      "PERSONAL STRATEGY REPORT",
      y,
      13,
      "helvetica",
      "normal",
      [100, 116, 139]
    );

    // User Info Box with premium styling
    y += 50; // More spacing before box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); // Softer border
    doc.setLineWidth(0.5); // Thinner border
    doc.roundedRect(pageWidth / 2 - 75, y, 150, 70, 6, 6, "FD"); // Larger box, bigger radius

    y += 22; // Better internal spacing
    centerText("PREPARED FOR", y, 9, "helvetica", "bold", [148, 163, 184]);
    y += 12; // Improved spacing
    centerText(data.userName, y, 19, "helvetica", "bold", [30, 41, 59]);
    y += 12; // Better spacing
    centerText(data.userEmail, y, 10, "helvetica", "normal", [100, 116, 139]);

    // Bottom Date with more space
    centerText(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      pageHeight - 35,
      10,
      "helvetica",
      "normal",
      [148, 163, 184]
    );

    // --- EXECUTIVE SUMMARY ---
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F"); // Reset bg
    addFooter(2);

    y = margin + 10;
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Executive Summary", margin, y);

    y += 20;

    // Focus Areas Box with premium styling
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(186, 230, 253);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 50, 5, 5, "FD"); // Taller, larger radius

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(14, 165, 233);
    doc.text("PRIMARY FOCUS", margin + 12, y + 15); // Better padding

    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);
    doc.text(data.primaryCategory, margin + 12, y + 32); // Better positioning

    // Secondary Areas
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("SUPPORTING AREAS", pageWidth / 2 + 5, y + 15);

    doc.setFontSize(15);
    doc.setTextColor(51, 65, 85);
    doc.text(data.secondaryCategories.join(", "), pageWidth / 2 + 5, y + 32);

    y += 65; // More spacing after box

    // Introduction Text with better readability
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const introText = `This blueprint outlines your strategic path for ${APP_CONFIG.year}. You have identified ${data.primaryCategory} as your "Keystone Habit" area—the one change that will create a ripple effect across your life. The following pages detail your specific goals, action steps, and motivation systems.`;
    const splitIntro = doc.splitTextToSize(introText, pageWidth - margin * 2);
    doc.text(splitIntro, margin, y, { lineHeightFactor: 1.6 }); // Better line spacing

    y += 35; // More spacing before goal pages

    // --- GOAL PAGES ---
    let pageNum = 3;

    data.goals.forEach((goal, index) => {
      if (y > pageHeight - 50) {
        doc.addPage();
        addFooter(pageNum++);
        y = margin + 10;
      } else if (index > 0) {
        doc.addPage();
        addFooter(pageNum++);
        y = margin + 10;
      }

      // Goal Header Card with refined design
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 40, 5, 5, "FD"); // Taller, larger radius

      // Category Badge with better styling
      doc.setFillColor(99, 102, 241);
      doc.roundedRect(margin + 8, y + 8, 35, 10, 5, 5, "F"); // Larger badge
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(goal.category.toUpperCase(), margin + 25.5, y + 15, {
        align: "center",
      });

      // Main Goal Text with text wrapping to prevent overflow
      doc.setFontSize(15);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      const goalTextWidth = pageWidth - margin * 2 - 16; // Account for padding
      const wrappedGoalText = doc.splitTextToSize(goal.mainGoal, goalTextWidth);
      doc.text(wrappedGoalText, margin + 8, y + 28, { lineHeightFactor: 1.3 });

      y += 55; // More spacing after header

      // Action Plan Section with better spacing
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(99, 102, 241);
      doc.text("ACTION PLAN", margin, y);
      y += 10; // More spacing

      autoTable(doc, {
        startY: y,
        head: [["Timeline", "Action Step"]],
        body: [
          ["Small Step (Now)", goal.actions.small],
          ["Medium Step (Soon)", goal.actions.medium],
          ["Big Step (Later)", goal.actions.big],
        ],
        theme: "plain",
        headStyles: {
          fillColor: [99, 102, 241],
          fontSize: 10,
          fontStyle: "bold",
          cellPadding: 10, // Increased padding
          textColor: [255, 255, 255],
        },
        bodyStyles: {
          fontSize: 10.5,
          cellPadding: 10, // Increased padding
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Subtle alternating rows
        },
        columnStyles: {
          0: {
            cellWidth: 48,
            fontStyle: "bold",
            textColor: [71, 85, 105],
          },
        },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 25; // More spacing between sections

      // Motivation Table with refined styling
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(99, 102, 241);
      doc.text("MOTIVATION SYSTEM", margin, y);
      y += 10; // Better spacing

      autoTable(doc, {
        startY: y,
        head: [["Why it Matters (Gain)", "Cost of Inaction (Pain)"]],
        body: [[goal.motivation.why, goal.motivation.consequence]],
        theme: "plain",
        headStyles: {
          fillColor: [71, 85, 105],
          fontSize: 10,
          fontStyle: "bold",
          cellPadding: 10,
          textColor: [255, 255, 255],
        },
        bodyStyles: {
          fontSize: 10.5,
          cellPadding: 12, // Generous padding
          lineColor: [203, 213, 225],
          lineWidth: 0.3,
          textColor: [51, 65, 85],
        },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 25; // Better spacing

      // Monthly Check-in Box with premium styling
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 35, 5, 5, "FD"); // Taller, larger radius

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text("MONTHLY CHECK-IN STRATEGY", margin + 10, y + 12); // Better padding

      doc.setFontSize(10.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(21, 128, 61);
      const checkInLines = doc.splitTextToSize(
        goal.monthlyCheckIn,
        pageWidth - margin * 2 - 20
      );
      doc.text(checkInLines, margin + 10, y + 22, { lineHeightFactor: 1.5 }); // Better line spacing
    });

    // Save the PDF
    try {
      const fileName = `${data.userName.replace(/\s+/g, "_")}_${
        APP_CONFIG.year
      }_Success_Blueprint.pdf`;
      doc.save(fileName);
      return { success: true, fileName };
    } catch (saveError) {
      logger.error("Failed to save PDF:", saveError);
      throw new Error(
        "Failed to save PDF file. Please check your browser permissions."
      );
    }
  } catch (error) {
    logger.error("PDF Generation Error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate PDF. Please try again.");
  }
};
