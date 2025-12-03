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

    // Helper to draw Radar Chart (Spider Web)
    const drawRadarChart = (
      centerX: number,
      centerY: number,
      radius: number,
      ratings: Record<LifeCategory, number>
    ) => {
      const categories = Object.keys(ratings) as LifeCategory[];
      const numPoints = categories.length;
      const angleStep = (Math.PI * 2) / numPoints;
      
      // Draw Grid (Concentric webs)
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.1);
      
      for (let level = 1; level <= 5; level++) {
        const r = (radius / 5) * level;
        for (let i = 0; i < numPoints; i++) {
          const angle = i * angleStep - Math.PI / 2; // Start from top
          const nextAngle = ((i + 1) % numPoints) * angleStep - Math.PI / 2;
          
          const x1 = centerX + Math.cos(angle) * r;
          const y1 = centerY + Math.sin(angle) * r;
          const x2 = centerX + Math.cos(nextAngle) * r;
          const y2 = centerY + Math.sin(nextAngle) * r;
          
          doc.line(x1, y1, x2, y2);
        }
      }

      // Draw Axes
      categories.forEach((cat, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        doc.line(centerX, centerY, x, y);

        // Labels
        const labelR = radius + 15;
        const lx = centerX + Math.cos(angle) * labelR;
        const ly = centerY + Math.sin(angle) * labelR;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(cat, lx, ly, { align: "center", baseline: "middle" });
      });

      // Draw Data Polygon
      doc.setDrawColor(99, 102, 241); // Indigo-500
      doc.setLineWidth(1.5);
      doc.setFillColor(99, 102, 241);
      doc.setGState(new (doc as any).GState({ opacity: 0.2 })); // Transparent fill

      const points: {x: number, y: number}[] = [];
      categories.forEach((cat, i) => {
        const score = ratings[cat] || 0;
        const r = (radius / 10) * score; // Scale 1-10
        const angle = i * angleStep - Math.PI / 2;
        points.push({
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r
        });
      });

      // Draw filled polygon
      if (points.length > 0) {
        doc.lines(
          points.map((p, i) => {
            if (i === 0) return [p.x, p.y]; // Move to first
            const prev = points[i-1];
            return [p.x - prev.x, p.y - prev.y]; // Relative lines
          }) as any, // Type cast for jspdf lines
          points[0].x,
          points[0].y,
          [1, 1], // Scale
          "F", // Fill
          true // Closed
        );
        
        // Draw outline
        doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
        points.forEach((p, i) => {
          const next = points[(i + 1) % points.length];
          doc.line(p.x, p.y, next.x, next.y);
          // Draw dots at points
          doc.setFillColor(99, 102, 241);
          doc.circle(p.x, p.y, 2, "F");
        });
      }
    };

    // --- COVER PAGE ---
    // Premium Midnight Blue Background
    doc.setFillColor(30, 27, 75); // Midnight Blue (#1e1b4b)
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Constellation Pattern (Subtle Background)
    doc.setDrawColor(255, 255, 255);
    doc.setFillColor(255, 255, 255);
    
    // Draw some random stars/dots for constellation effect
    const stars = [
      { x: 30, y: 40, r: 0.5 }, { x: 180, y: 50, r: 0.8 },
      { x: 50, y: 250, r: 0.6 }, { x: 160, y: 270, r: 0.5 },
      { x: 105, y: 20, r: 1.0 }, { x: 20, y: 150, r: 0.4 },
      { x: 190, y: 140, r: 0.4 }, { x: 105, y: 280, r: 0.7 },
      // Constellation group 1 (Top Left)
      { x: 40, y: 60, r: 0.8 }, { x: 60, y: 75, r: 0.6 }, { x: 55, y: 95, r: 0.7 },
      // Constellation group 2 (Bottom Right)
      { x: 150, y: 220, r: 0.8 }, { x: 170, y: 235, r: 0.6 }, { x: 165, y: 205, r: 0.7 },
    ];

    stars.forEach(star => {
      doc.circle(star.x, star.y, star.r, "F");
    });

    // Draw thin connecting lines for constellations
    doc.setLineWidth(0.1);
    doc.setDrawColor(255, 255, 255);
    doc.setGState(new (doc as any).GState({ opacity: 0.3 })); // Low opacity for lines
    
    // Connect group 1
    doc.line(40, 60, 60, 75);
    doc.line(60, 75, 55, 95);
    
    // Connect group 2
    doc.line(150, 220, 170, 235);
    doc.line(170, 235, 165, 205);
    
    doc.setGState(new (doc as any).GState({ opacity: 1.0 })); // Reset opacity

    // Main Content
    let y = 85;

    // Year - Large & Bold
    centerText(
      `${APP_CONFIG.year}`,
      y,
      90,
      "helvetica",
      "bold",
      [255, 255, 255] // White
    );

    y += 35;
    centerText("SUCCESS BLUEPRINT", y, 32, "helvetica", "bold", [226, 232, 240]); // Slate-200

    y += 20;
    doc.setDrawColor(99, 102, 241); // Indigo-500
    doc.setLineWidth(2);
    doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y); // Centered accent line

    y += 25;
    centerText(
      "PERSONAL STRATEGY REPORT",
      y,
      14,
      "helvetica",
      "normal",
      [148, 163, 184] // Slate-400
    );

    // User Info Box (Transparent/Glass effect)
    y += 55;
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
    doc.roundedRect(pageWidth / 2 - 75, y, 150, 70, 4, 4, "D"); // Border only
    doc.setGState(new (doc as any).GState({ opacity: 1.0 }));

    y += 22;
    centerText("PREPARED FOR", y, 9, "helvetica", "bold", [148, 163, 184]); // Slate-400
    y += 12;
    centerText(data.userName, y, 20, "helvetica", "bold", [255, 255, 255]);
    y += 12;
    centerText(data.userEmail, y, 10, "helvetica", "normal", [203, 213, 225]); // Slate-300

    // Bottom "Confidential" or Date
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
      [100, 116, 139] // Slate-500
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

    // Wheel of Life Visualization
    if (data.lifeWheelRatings && Object.keys(data.lifeWheelRatings).length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text("YOUR WHEEL OF LIFE", pageWidth / 2, y, { align: "center" });
      
      y += 55; // Space for chart center
      drawRadarChart(pageWidth / 2, y, 40, data.lifeWheelRatings);
      y += 60; // Space after chart
    } else {
      // Fallback if no ratings (shouldn't happen with new flow)
      y += 10;
    }

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
