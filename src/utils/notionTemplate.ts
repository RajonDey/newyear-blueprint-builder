/**
 * Notion Template Generator
 * Creates a Notion-compatible template from user's blueprint data
 */

import { CategoryGoal, LifeCategory } from '@/types/wizard';
import { APP_CONFIG } from '@/lib/config';

interface NotionTemplateData {
  userName: string;
  userEmail: string;
  goals: CategoryGoal[];
  primaryCategory: LifeCategory | null;
  secondaryCategories: LifeCategory[];
}

/**
 * Generates a Notion-compatible CSV template
 * This can be imported into Notion as a database
 */
export function generateNotionCSV(data: NotionTemplateData): string {
  const headers = [
    'Category',
    'Type',
    'Main Goal',
    'Small Action',
    'Medium Action',
    'Big Action',
    'Monthly Check-in',
    'Why It Matters',
    'Cost of Inaction',
    'Status',
    'Priority'
  ];

  const rows: string[][] = [];

  data.goals.forEach((goal) => {
    const isPrimary = goal.category === data.primaryCategory;
    const priority = isPrimary ? 'High' : 'Medium';
    
    rows.push([
      goal.category,
      isPrimary ? 'Primary' : 'Secondary',
      goal.mainGoal || '',
      goal.actions.small || '',
      goal.actions.medium || '',
      goal.actions.big || '',
      goal.monthlyCheckIn || '',
      goal.motivation.why || '',
      goal.motivation.consequence || '',
      'Not Started',
      priority
    ]);
  });

  // Convert to CSV format
  const csvRows = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Escape commas and quotes in cell values
        const escaped = String(cell).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

/**
 * Generates a Notion markdown template
 * This can be pasted directly into Notion pages
 */
export function generateNotionMarkdown(data: NotionTemplateData): string {
  const year = APP_CONFIG.year;
  let markdown = `# ${year} Success Blueprint\n\n`;
  markdown += `**Created for:** ${data.userName}\n`;
  markdown += `**Email:** ${data.userEmail}\n`;
  markdown += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
  markdown += `---\n\n`;

  markdown += `## Focus Areas\n\n`;
  markdown += `**Primary:** ${data.primaryCategory || 'Not set'}\n\n`;
  if (data.secondaryCategories.length > 0) {
    markdown += `**Secondary:** ${data.secondaryCategories.join(', ')}\n\n`;
  }
  markdown += `---\n\n`;

  data.goals.forEach((goal, index) => {
    const isPrimary = goal.category === data.primaryCategory;
    markdown += `## ${index + 1}. ${goal.category} ${isPrimary ? '⭐ (Primary)' : ''}\n\n`;
    
    markdown += `### Main Goal\n\n`;
    markdown += `${goal.mainGoal || 'Not set'}\n\n`;
    
    markdown += `### Action Steps\n\n`;
    markdown += `**Small Step:** ${goal.actions.small || 'Not set'}\n\n`;
    markdown += `**Medium Step:** ${goal.actions.medium || 'Not set'}\n\n`;
    markdown += `**Big Step:** ${goal.actions.big || 'Not set'}\n\n`;
    
    markdown += `### Monthly Check-in\n\n`;
    markdown += `${goal.monthlyCheckIn || 'Not set'}\n\n`;
    
    markdown += `### Motivation\n\n`;
    markdown += `**Why it matters:** ${goal.motivation.why || 'Not set'}\n\n`;
    markdown += `**Cost of inaction:** ${goal.motivation.consequence || 'Not set'}\n\n`;
    
    markdown += `---\n\n`;
  });

  markdown += `## Progress Tracking\n\n`;
  markdown += `Use this section to track your progress throughout the year.\n\n`;
  markdown += `### Monthly Reviews\n\n`;
  markdown += `- [ ] January Review\n`;
  markdown += `- [ ] February Review\n`;
  markdown += `- [ ] March Review\n`;
  markdown += `- [ ] April Review\n`;
  markdown += `- [ ] May Review\n`;
  markdown += `- [ ] June Review\n`;
  markdown += `- [ ] July Review\n`;
  markdown += `- [ ] August Review\n`;
  markdown += `- [ ] September Review\n`;
  markdown += `- [ ] October Review\n`;
  markdown += `- [ ] November Review\n`;
  markdown += `- [ ] December Review\n\n`;

  return markdown;
}

/**
 * Downloads the Notion template as a file
 */
export function downloadNotionTemplate(
  data: NotionTemplateData,
  format: 'csv' | 'markdown' = 'markdown'
): void {
  try {
    const content = format === 'csv' 
      ? generateNotionCSV(data)
      : generateNotionMarkdown(data);
    
    const extension = format === 'csv' ? 'csv' : 'md';
    const fileName = `${data.userName.replace(/\s+/g, '_')}_${APP_CONFIG.year}_Notion_Template.${extension}`;
    
    const blob = new Blob([content], { 
      type: format === 'csv' ? 'text/csv' : 'text/markdown' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    // Error will be handled by caller
    throw new Error('Failed to download Notion template. Please try again.');
  }
}

