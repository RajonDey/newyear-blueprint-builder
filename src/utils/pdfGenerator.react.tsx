/**
 * React-PDF Implementation - Premium PDF Generator
 * 
 * This is the new React-PDF based implementation that provides
 * significantly better design capabilities and maintainability.
 * 
 * To enable: Set VITE_USE_REACT_PDF=true in your .env file
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
  Image,
} from '@react-pdf/renderer';
import { CategoryGoal, LifeCategory } from '@/types/wizard';
import { APP_CONFIG } from '@/lib/config';

// PDF Data Interface
export interface PDFData {
  userName: string;
  userEmail: string;
  goals: CategoryGoal[];
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
}

// Register Roboto font for Unicode symbol support
// Helvetica doesn't support many Unicode symbols (●◆♥▲■★)
// Roboto has full Unicode coverage and renders beautifully
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf',
      fontStyle: 'italic',
      fontWeight: 'normal',
    },
  ],
});

// ============================================================================
// STYLING SYSTEM
// ============================================================================

// Color Palette
const colors = {
  // Primary Brand
  primary: {
    main: '#6366F1',      // Indigo-500
    light: '#818CF8',      // Indigo-400
    dark: '#4F46E5',      // Indigo-600
  },
  
  // Neutrals (Slate)
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Semantic Colors
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    500: '#0EA5E9',
  },
  
  green: {
    50: '#F0FDF4',
    200: '#BBF7D0',
    600: '#16A34A',
    700: '#15803D',
  },
  
  // Category-specific colors
  health: { main: '#10B981', light: '#D1FAE5' },      // Emerald
  wealth: { main: '#F59E0B', light: '#FEF3C7' },      // Amber
  relationships: { main: '#EC4899', light: '#FCE7F3' }, // Pink
  career: { main: '#6366F1', light: '#E0E7FF' },     // Indigo
  learning: { main: '#8B5CF6', light: '#EDE9FE' },    // Purple
  personal: { main: '#06B6D4', light: '#CFFAFE' },    // Cyan
  social: { main: '#14B8A6', light: '#CCFBF1' },      // Teal
  environment: { main: '#84CC16', light: '#ECFCCB' }, // Lime
  
  // Utility
  white: '#FFFFFF',
  black: '#000000',
};

// Category symbols - bold, professional, guaranteed to render
// Category images - 100% reliable PNGs
const categoryTheme: Record<string, { iconPath: string; color: string; lightColor: string }> = {
  Health: { iconPath: '/assets/pdf-icons/icon-health.png', color: colors.health.main, lightColor: colors.health.light },
  Wealth: { iconPath: '/assets/pdf-icons/icon-wealth.png', color: colors.wealth.main, lightColor: colors.wealth.light },
  Relationships: { iconPath: '/assets/pdf-icons/icon-relationships.png', color: colors.relationships.main, lightColor: colors.relationships.light },
  Career: { iconPath: '/assets/pdf-icons/icon-career.png', color: colors.career.main, lightColor: colors.career.light },
  Learning: { iconPath: '/assets/pdf-icons/icon-learning.png', color: colors.learning.main, lightColor: colors.learning.light },
  'Personal Growth': { iconPath: '/assets/pdf-icons/icon-growth.png', color: colors.personal.main, lightColor: colors.personal.light },
  Social: { iconPath: '/assets/pdf-icons/icon-social.png', color: colors.social.main, lightColor: colors.social.light },
  'Home/Environment': { iconPath: '/assets/pdf-icons/icon-home.png', color: colors.environment.main, lightColor: colors.environment.light },
};

// Typography Scale
const typography = {
  h1: 32,
  h2: 24,
  h3: 18,
  h4: 15,
  body: 11,
  small: 9,
  tiny: 7.5,
};

// Spacing System
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

// Create Stylesheet
const styles = StyleSheet.create({
  // ========== PAGE LAYOUT ==========
  page: {
    backgroundColor: colors.white,
    padding: spacing['3xl'],
    fontFamily: 'Roboto',
  },
  
  pageCover: {
    backgroundColor: colors.slate[50],
    padding: 0,
  },
  
  // ========== COVER PAGE ==========
  coverTopBar: {
    height: 15,
    backgroundColor: colors.primary.main,
  },
  
  coverLogo: {
    width: 250,
    height: 210, // Calculated from 940/788 ratio (approx 1.19)
    objectFit: 'contain',
    marginBottom: spacing.xl,
  },
  
  coverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  
  coverYear: {
    fontSize: 85,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: spacing.lg,
  },
  
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.slate[800],
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  
  coverSubtitle: {
    fontSize: 13,
    color: colors.slate[500],
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  
  coverLine: {
    width: 150,
    height: 1.5,
    backgroundColor: colors.primary.main,
    marginVertical: spacing.md,
  },
  
  coverUserBox: {
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: colors.slate[200],
    padding: spacing.xl,
    marginTop: spacing['3xl'],
    width: 180,
    alignItems: 'center',
  },
  
  coverUserLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.slate[400],
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  
  coverUserName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colors.slate[800],
    marginBottom: spacing.sm,
  },
  
  coverUserEmail: {
    fontSize: 10,
    color: colors.slate[500],
  },
  
  coverDate: {
    position: 'absolute',
    bottom: spacing['2xl'],
    fontSize: 10,
    color: colors.slate[400],
  },
  
  // ========== EXECUTIVE SUMMARY ==========
  summaryTitle: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: colors.slate[800],
    marginBottom: spacing.xl,
  },
  
  focusBox: {
    backgroundColor: colors.sky[50],
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: colors.sky[200],
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  focusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  focusColumn: {
    flex: 1,
    paddingRight: spacing.md,
  },
  
  focusLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.sky[500],
    marginBottom: spacing.sm,
  },
  
  focusText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.slate[900],
  },
  
  focusSecondary: {
    fontSize: 15,
    color: colors.slate[700],
  },
  
  introText: {
    fontSize: typography.body,
    color: colors.slate[700],
    lineHeight: 1.6,
    marginBottom: spacing.xl,
  },
  
  // ========== GOAL CARDS ==========
  goalCard: {
    backgroundColor: colors.slate[50],
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.slate[200],
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  goalBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginRight: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  

  
  goalBadgeIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    objectFit: 'contain',
  },
  
  goalBadgeText: {
    fontSize: typography.tiny,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 0.5,
  },
  
  goalTitle: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.slate[800],
    flex: 1,
    lineHeight: 1.3,
  },
  
  // ========== SECTIONS ==========

  
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  sectionIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    objectFit: 'contain',
  },
  
  stepCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  
  stepNumber: {
    fontSize: 9,
    color: colors.white,
    fontWeight: 'bold',
  },
  
  stepLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
  },
  
  // ========== TABLES ==========
  table: {
    marginVertical: spacing.md,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary.main,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  
  tableRowAlt: {
    backgroundColor: colors.slate[50],
  },
  
  tableCell: {
    fontSize: 10.5,
    color: colors.slate[700],
    lineHeight: 1.5,
  },
  
  tableCellLabel: {
    fontWeight: 'bold',
    color: colors.slate[600],
    width: '30%',
  },
  
  tableCellContent: {
    flex: 1,
  },
  
  // ========== MOTIVATION BOX ==========
  motivationTable: {
    marginVertical: spacing.md,
  },
  
  motivationHeader: {
    flexDirection: 'row',
    backgroundColor: colors.slate[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  
  motivationHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
  },
  
  motivationRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[300],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  
  motivationCell: {
    fontSize: 10.5,
    color: colors.slate[700],
    flex: 1,
    lineHeight: 1.5,
    paddingHorizontal: spacing.sm,
  },
  
  // ========== CHECK-IN BOX ==========
  checkInBox: {
    backgroundColor: colors.green[50],
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.green[600],
    borderStyle: 'dashed',
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  
  checkInTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.green[600],
    marginBottom: spacing.sm,
  },
  
  checkInText: {
    fontSize: 10.5,
    color: colors.green[700],
    lineHeight: 1.5,
  },
  
  // ========== ICONS & VISUAL ELEMENTS ==========
  icon: {
    marginRight: spacing.sm,
  },
  
  categoryIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.slate[50],
    padding: spacing.lg,
    borderRadius: 8,
  },
  
  timelineStep: {
    flexDirection: 'column',
    alignItems: 'center',
    width: 60,
  },
  
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: colors.white,
  },
  
  timelineLine: {
    height: 3,
    flex: 1,
    backgroundColor: colors.slate[200],
    marginHorizontal: -10,
    zIndex: -1,
    marginTop: -18,
  },
  
  timelineLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.slate[600],
    marginTop: 4,
    textAlign: 'center',
  },
  
  // ========== FOOTER ==========
  footer: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    fontSize: typography.small,
    color: colors.slate[400],
    textAlign: 'center',
  },
  
  pageHeader: {
    position: 'absolute',
    top: spacing.md,
    right: spacing['3xl'],
    width: 40,
    height: 34, // Calculated from 940/788 ratio
    opacity: 0.5, // Increased opacity slightly for better visibility
    objectFit: 'contain',
  },
});

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Cover Page Component
 */
const CoverPage: React.FC<{ data: PDFData }> = ({ data }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <Page size="A4" style={styles.pageCover}>
      <View style={styles.coverTopBar} />
      <View style={styles.coverContainer}>
        {/* Logo */}
        <Image 
          src="/YearInReview-logo.png" 
          style={styles.coverLogo}
        />
        
        <Text style={styles.coverYear}>{APP_CONFIG.year}</Text>
        <Text style={styles.coverTitle}>SUCCESS BLUEPRINT</Text>
        <View style={styles.coverLine} />
        <Text style={styles.coverSubtitle}>PERSONAL STRATEGY REPORT</Text>
        
        <View style={styles.coverUserBox}>
          <Text style={styles.coverUserLabel}>PREPARED FOR</Text>
          <Text style={styles.coverUserName}>{data.userName}</Text>
          <Text style={styles.coverUserEmail}>{data.userEmail}</Text>
        </View>
        
        <Text style={styles.coverDate}>{currentDate}</Text>
      </View>
    </Page>
  );
};

/**
 * Executive Summary Page
 */
const ExecutiveSummary: React.FC<{ data: PDFData }> = ({ data }) => {
  const primaryTheme = categoryTheme[data.primaryCategory || ''] || categoryTheme['Career'];
  
  return (
    <Page size="A4" style={styles.page}>
      {/* Subtle logo watermark */}
      <Image 
        src="/YearInReview-logo.png" 
        style={styles.pageHeader}
      />
      
      <Text style={styles.summaryTitle}>Executive Summary</Text>
      
      <View style={styles.focusBox}>
        <View style={styles.focusRow}>
          <View style={styles.focusColumn}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Image src="/assets/pdf-icons/icon-star.png" style={{ width: 12, height: 12, marginRight: 6 }} />
              <Text style={styles.focusLabel}>PRIMARY FOCUS</Text>
            </View>
            <Text style={styles.focusText}>
              {data.primaryCategory}
            </Text>
          </View>
          <View style={styles.focusColumn}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Image src="/assets/pdf-icons/icon-list.png" style={{ width: 12, height: 12, marginRight: 6 }} />
              <Text style={styles.focusLabel}>SUPPORTING AREAS</Text>
            </View>
            <Text style={styles.focusSecondary}>
              {data.secondaryCategories.join(', ')}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={[styles.introText, { fontSize: 12, marginBottom: spacing['2xl'] }]}>
        This blueprint outlines your strategic path for {APP_CONFIG.year}. You have
        identified {data.primaryCategory} as your "Keystone Habit" area—the one change
        that will create a ripple effect across your life. The following pages detail
        your specific goals, action steps, and motivation systems.
      </Text>

      <View style={{ marginTop: spacing.xl, padding: spacing.xl, backgroundColor: colors.slate[50], borderRadius: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primary.main, marginBottom: spacing.md }}>
          MY COMMITMENT
        </Text>
        <Text style={{ fontSize: 11, color: colors.slate[600], fontStyle: 'italic', lineHeight: 1.6 }}>
          "I am committed to taking consistent action on these goals. I understand that progress is better than perfection, and I will focus on the systems and habits that lead to long-term success."
        </Text>
      </View>
      
      <Text style={styles.footer}>
        Your {APP_CONFIG.year} Success Blueprint • Page 2
      </Text>
    </Page>
  );
};

/**
 * Goal Page Component
 */
const GoalPage: React.FC<{ goal: CategoryGoal; index: number }> = ({ goal, index }) => {
  const theme = categoryTheme[goal.category] || categoryTheme['Career'];
  
  return (
    <Page size="A4" style={styles.page}>
      {/* Subtle logo watermark */}
      <Image 
        src="/YearInReview-logo.png" 
        style={styles.pageHeader}
      />
      
      {/* Goal Header with category color */}
      <View style={[styles.goalCard, { backgroundColor: theme.lightColor }]}>
        {/* Colored accent bar */}
        <View style={[styles.accentBar, { backgroundColor: theme.color }]} />
        
        <View style={styles.goalHeader}>
          <View style={[styles.goalBadge, { backgroundColor: theme.color }]}>
            <Image 
              src={theme.iconPath} 
              style={styles.goalBadgeIcon}
            />
            <Text style={styles.goalBadgeText}>
              {goal.category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.goalTitle}>{goal.mainGoal}</Text>
        </View>
      </View>
      
      {/* Timeline Visualization */}
      <View style={styles.timeline}>
        <View style={styles.timelineStep}>
          <View style={[styles.timelineDot, { backgroundColor: theme.color }]} />
          <Text style={styles.timelineLabel}>NOW</Text>
          <Text style={{ fontSize: 7, color: colors.slate[400] }}>Immediate</Text>
        </View>
        <View style={styles.timelineLine} />
        <View style={styles.timelineStep}>
          <View style={[styles.timelineDot, { backgroundColor: colors.slate[300] }]} />
          <Text style={styles.timelineLabel}>SOON</Text>
          <Text style={{ fontSize: 7, color: colors.slate[400] }}>Short Term</Text>
        </View>
        <View style={styles.timelineLine} />
        <View style={styles.timelineStep}>
          <View style={[styles.timelineDot, { backgroundColor: colors.slate[300] }]} />
          <Text style={styles.timelineLabel}>LATER</Text>
          <Text style={{ fontSize: 7, color: colors.slate[400] }}>Long Term</Text>
        </View>
      </View>
      
      {/* Action Plan */}
      {/* Action Plan */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md }}>
        <Image src="/assets/pdf-icons/icon-target.png" style={styles.sectionIcon} />
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary.main }}>ACTION PLAN</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Timeline</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Action Step</Text>
        </View>
        
        <View style={styles.tableRow}>
          <View style={styles.stepLabelContainer}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={{ fontWeight: 'bold', color: colors.slate[600], fontSize: 10 }}>Small Step</Text>
          </View>
          <Text style={[styles.tableCell, styles.tableCellContent]}>
            {goal.actions.small}
          </Text>
        </View>
        
        <View style={[styles.tableRow, styles.tableRowAlt]}>
          <View style={styles.stepLabelContainer}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={{ fontWeight: 'bold', color: colors.slate[600], fontSize: 10 }}>Medium Step</Text>
          </View>
          <Text style={[styles.tableCell, styles.tableCellContent]}>
            {goal.actions.medium}
          </Text>
        </View>
        
        <View style={styles.tableRow}>
          <View style={styles.stepLabelContainer}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={{ fontWeight: 'bold', color: colors.slate[600], fontSize: 10 }}>Big Step</Text>
          </View>
          <Text style={[styles.tableCell, styles.tableCellContent]}>
            {goal.actions.big}
          </Text>
        </View>
      </View>
      
      {/* Motivation System */}
      {/* Motivation System */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md }}>
        <Image src="/assets/pdf-icons/icon-bulb.png" style={styles.sectionIcon} />
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary.main }}>MOTIVATION SYSTEM</Text>
      </View>
      <View style={styles.motivationTable}>
        <View style={styles.motivationHeader}>
          <Text style={styles.motivationHeaderCell}>Why it Matters (Gain)</Text>
          <Text style={styles.motivationHeaderCell}>Cost of Inaction (Pain)</Text>
        </View>
        <View style={styles.motivationRow}>
          <Text style={styles.motivationCell}>{goal.motivation.why}</Text>
          <Text style={styles.motivationCell}>{goal.motivation.consequence}</Text>
        </View>
      </View>
      
      {/* Monthly Check-in */}
      <View style={styles.checkInBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          <Image src="/assets/pdf-icons/icon-calendar.png" style={{ width: 12, height: 12, marginRight: 6 }} />
          <Text style={styles.checkInTitle}>MONTHLY CHECK-IN STRATEGY</Text>
        </View>
        <Text style={styles.checkInText}>{goal.monthlyCheckIn}</Text>
      </View>
      
      <Text style={styles.footer}>
        Your {APP_CONFIG.year} Success Blueprint • Page {index + 3}
      </Text>
    </Page>
  );
};

/**
 * Main Document Component
 */
const SuccessBlueprintDocument: React.FC<{ data: PDFData }> = ({ data }) => {
  return (
    <Document>
      <CoverPage data={data} />
      <ExecutiveSummary data={data} />
      {data.goals.map((goal, index) => (
        <GoalPage key={goal.category} goal={goal} index={index} />
      ))}
    </Document>
  );
};

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Generate Success PDF using React-PDF
 * 
 * @param data - PDF generation data
 * @returns Success/failure result with filename
 */
export const generateSuccessPDF_React = async (data: PDFData) => {
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

    // Generate PDF blob
    const blob = await pdf(<SuccessBlueprintDocument data={data} />).toBlob();
    
    // Create filename
    const fileName = `${data.userName.replace(/\s+/g, '_')}_${APP_CONFIG.year}_Success_Blueprint.pdf`;
    
    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('React-PDF Generation Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate PDF. Please try again.');
  }
};
