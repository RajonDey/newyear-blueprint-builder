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
  let markdown = `# ${year} Success Blueprint 🚀\n\n`;
  
  // Dashboard Header
  markdown += `> "The future depends on what you do today."\n\n`;
  markdown += `**Owner:** ${data.userName}\n`;
  markdown += `**Focus:** ${data.primaryCategory}\n\n`;
  markdown += `---\n\n`;

  // Quick Links / Navigation (Simulated)
  markdown += `## 🧭 Dashboard\n\n`;
  markdown += `* [Goals](#goals)\n`;
  markdown += `* [Habit Tracker](#habit-tracker)\n`;
  markdown += `* [Monthly Reviews](#monthly-reviews)\n\n`;

  // Focus Areas
  markdown += `## 🎯 Focus Areas\n\n`;
  markdown += `### 🌟 Primary Focus: ${data.primaryCategory || 'Not set'}\n`;
  markdown += `This is your "Keystone" area for ${year}. Success here will ripple elsewhere.\n\n`;
  
  if (data.secondaryCategories.length > 0) {
    markdown += `### 🔧 Supporting Areas\n`;
    markdown += `${data.secondaryCategories.map(c => `* ${c}`).join('\n')}\n\n`;
  }
  markdown += `---\n\n`;

  // Goals Section
  markdown += `## 🏆 Goals <a name="goals"></a>\n\n`;
  
  data.goals.forEach((goal, index) => {
    const isPrimary = goal.category === data.primaryCategory;
    const icon = isPrimary ? '⭐' : '📌';
    
    markdown += `### ${icon} ${goal.category}\n\n`;
    
    // Main Goal Callout
    markdown += `> **Main Goal:** ${goal.mainGoal || 'Not set'}\n\n`;
    
    markdown += `#### 📝 Action Plan\n`;
    markdown += `| Timeline | Action Step |\n`;
    markdown += `| :--- | :--- |\n`;
    markdown += `| **Small Step** | ${goal.actions.small || '-'} |\n`;
    markdown += `| **Medium Step** | ${goal.actions.medium || '-'} |\n`;
    markdown += `| **Big Step** | ${goal.actions.big || '-'} |\n\n`;
    
    markdown += `#### 🔥 Motivation\n`;
    markdown += `* **Why it matters:** ${goal.motivation.why || '-'}\n`;
    markdown += `* **Cost of inaction:** ${goal.motivation.consequence || '-'}\n\n`;
    
    markdown += `#### 📅 Check-in Strategy\n`;
    markdown += `${goal.monthlyCheckIn || '-'}\n\n`;
    markdown += `---\n\n`;
  });

  // Habit Tracker
  markdown += `## 📊 Habit Tracker <a name="habit-tracker"></a>\n\n`;
  markdown += `Copy this table for each month to track your daily habits.\n\n`;
  markdown += `| Habit | M | T | W | T | F | S | S |\n`;
  markdown += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;
  markdown += `| [Small Step Action] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |\n`;
  markdown += `| [Medium Step Action] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |\n`;
  markdown += `| Read 10 pages | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |\n`;
  markdown += `| Meditate 5 mins | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |\n\n`;

  // Monthly Reviews
  markdown += `## 📅 Monthly Reviews <a name="monthly-reviews"></a>\n\n`;
  markdown += `Schedule these on the last Sunday of every month.\n\n`;
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  months.forEach(month => {
    markdown += `### ${month}\n`;
    markdown += `- [ ] Review Goals\n`;
    markdown += `- [ ] Check Habit Progress\n`;
    markdown += `- [ ] Adjust Plan if needed\n\n`;
  });

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

