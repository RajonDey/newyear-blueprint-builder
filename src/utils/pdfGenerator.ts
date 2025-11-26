import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CategoryGoal, LifeCategory } from '@/types/wizard';
import { APP_CONFIG } from '@/lib/config';
import { logger } from '@/lib/logger';

interface PDFData {
  userName: string;
  userEmail: string;
  goals: CategoryGoal[];
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
}

export const generateSuccessPDF = (data: PDFData) => {
  try {
    // Validate input data
    if (!data.userName || !data.userEmail) {
      throw new Error('Missing required user information (name or email)');
    }

    if (!data.goals || data.goals.length === 0) {
      throw new Error('No goals to generate PDF');
    }

    if (!data.primaryCategory) {
      throw new Error('Primary category is required');
    }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header
  doc.setFillColor(99, 102, 241); // Primary color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`Your ${APP_CONFIG.year} Success Blueprint`, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Created for: ${data.userName}`, pageWidth / 2, 30, { align: 'center' });

  yPosition = 50;

  // User Info Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Email: ${data.userEmail}`, margin, yPosition);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, yPosition, { align: 'right' });
  
  yPosition += 15;

  // Categories Overview
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 102, 241);
  doc.text('Focus Areas', margin, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Primary: ${data.primaryCategory}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Secondary: ${data.secondaryCategories.join(', ')}`, margin, yPosition);
  
  yPosition += 15;

  // Goals Section
  data.goals.forEach((goal, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin;
    }

    // Goal Header
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(`${index + 1}. ${goal.category}`, margin + 5, yPosition + 3);
    
    yPosition += 15;

    // Main Goal
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('MAIN GOAL', margin, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const goalLines = doc.splitTextToSize(goal.mainGoal, pageWidth - 2 * margin);
    doc.text(goalLines, margin, yPosition);
    yPosition += goalLines.length * 5 + 8;

    // Action Steps Table
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ACTION STEPS', margin, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [['Level', 'Action']],
      body: [
        ['Small Step', goal.actions.small],
        ['Medium Step', goal.actions.medium],
        ['Big Step', goal.actions.big],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Monthly Check-in
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('MONTHLY CHECK-IN', margin, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const checkInLines = doc.splitTextToSize(goal.monthlyCheckIn, pageWidth - 2 * margin);
    doc.text(checkInLines, margin, yPosition);
    yPosition += checkInLines.length * 5 + 8;

    // Motivation Box
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Calculate box height based on content
    doc.setFontSize(9);
    const whyTestLines = doc.splitTextToSize(goal.motivation.why, pageWidth - 2 * margin - 10);
    const consequenceTestLines = doc.splitTextToSize(goal.motivation.consequence, pageWidth - 2 * margin - 10);
    const motivationHeight = 25 + (whyTestLines.length * 4) + (consequenceTestLines.length * 4);
    
    doc.setFillColor(254, 243, 199);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, motivationHeight, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text('YOUR MOTIVATION', margin + 5, yPosition + 2);
    
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('Why it matters:', margin + 5, yPosition);
    
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    const whyLines = doc.splitTextToSize(goal.motivation.why, pageWidth - 2 * margin - 10);
    doc.text(whyLines, margin + 5, yPosition);
    yPosition += whyLines.length * 4 + 6;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Cost of inaction:', margin + 5, yPosition);
    
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    const consequenceLines = doc.splitTextToSize(goal.motivation.consequence, pageWidth - 2 * margin - 10);
    doc.text(consequenceLines, margin + 5, yPosition);
    
    yPosition += motivationHeight - 20;
  });

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated by Your ${APP_CONFIG.year} Success Blueprint`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Save the PDF
  try {
    const fileName = `${data.userName.replace(/\s+/g, '_')}_${APP_CONFIG.year}_Success_Blueprint.pdf`;
    doc.save(fileName);
    return { success: true, fileName };
  } catch (saveError) {
    logger.error('Failed to save PDF:', saveError);
    throw new Error('Failed to save PDF file. Please check your browser permissions.');
  }
  } catch (error) {
    logger.error('PDF Generation Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate PDF. Please try again.');
  }
};
