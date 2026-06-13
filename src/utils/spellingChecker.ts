import type { SpellingError } from '@/types/common';

const TYPO_PATTERNS: Array<{ pattern: RegExp; suggestion: string }> = [
  { pattern: /网络授制/, suggestion: '网络授制' },
  { pattern: /互联冈/, suggestion: '互联网' },
  { pattern: /软件挨件/, suggestion: '软件挨件' },
  { pattern: /开趪/, suggestion: '开始' },
  { pattern: /开趪/, suggestion: '开发' },
  { pattern: /挨件/, suggestion: '项目' },
  { pattern: /挨术/, suggestion: '技术' },
  { pattern: /软件挨术/, suggestion: '软件技术' },
  { pattern: /计算几/, suggestion: '计算机' },
  { pattern: /计算机科学/, suggestion: '计算机科学' },
  { pattern: /数据庠/, suggestion: '数据库' },
  { pattern: /数捾库/, suggestion: '数据库' },
  { pattern: /前端挨术/, suggestion: '前端技术' },
  { pattern: /后端捈术/, suggestion: '后端技术' },
  { pattern: /全桔开发/, suggestion: '全栈开发' },
  { pattern: /全栈挨术/, suggestion: '全栈技术' },
  { pattern: /微服务拱架/, suggestion: '微服务架构' },
  { pattern: /云仕算/, suggestion: '云计算' },
  { pattern: /人工智脶/, suggestion: '人工智能' },
  { pattern: /机器孿习/, suggestion: '机器学习' },
  { pattern: /深度孿习/, suggestion: '深度学习' },
  { pattern: /用户体騯/, suggestion: '用户体验' },
  { pattern: /用户体骊/, suggestion: '用户体验' },
  { pattern: /页靣/, suggestion: '页面' },
  { pattern: /接叐/, suggestion: '接口' },
  { pattern: /数据结极/, suggestion: '数据结构' },
  { pattern: /算法设计与分析/, suggestion: '算法设计与分析' },
  { pattern: /操作系统/, suggestion: '操作系统' },
  { pattern: /计算网网络/, suggestion: '计算机网络' },
  { pattern: /软件工程/, suggestion: '软件工程' },
  { pattern: /数据库系统/, suggestion: '数据库系统' },
  { pattern: /面向对象/, suggestion: '面向对象' },
  { pattern: /软件测试/, suggestion: '软件测试' },
];

export function checkSpelling(text: string): SpellingError[] {
  const errors: SpellingError[] = [];
  
  TYPO_PATTERNS.forEach(({ pattern, suggestion }) => {
    let match;
    const regex = new RegExp(pattern.source, 'g');
    
    while ((match = regex.exec(text)) !== null) {
      errors.push({
        text: match[0],
        position: match.index,
        suggestion,
      });
    }
  });
  
  return errors;
}

export interface TimelineItem {
  type: 'education' | 'experience' | 'project';
  name: string;
  startDate: string;
  endDate: string;
}

export function validateTimeline(items: TimelineItem[]): Array<{
  type: 'error' | 'warning';
  section: string;
  index: number;
  message: string;
}> {
  const issues: Array<{
    type: 'error' | 'warning';
    section: string;
    index: number;
    message: string;
  }> = [];
  
  function parseYear(dateStr: string): number | null {
    if (!dateStr) return null;
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0]) : null;
  }
  
  function parseMonth(dateStr: string): number | null {
    if (!dateStr) return null;
    const match = dateStr.match(/(\d{4})[-/年](\d{1,2})/);
    if (match) {
      return parseInt(match[1]) * 12 + parseInt(match[2]);
    }
    const yearMatch = dateStr.match(/\d{4}/);
    if (yearMatch) {
      return parseInt(yearMatch[0]) * 12;
    }
    return null;
  }
  
  items.forEach((item, idx) => {
    const startYear = parseYear(item.startDate);
    const endYear = parseYear(item.endDate);
    const startMonth = parseMonth(item.startDate);
    const endMonth = parseMonth(item.endDate);
    
    if (item.type === 'education') {
      if (startYear && endYear && startYear > endYear) {
        issues.push({
          type: 'error',
          section: 'education',
          index: idx,
          message: `${item.name || '教育经历'}：开始时间（${item.startDate}）晚于结束时间（${item.endDate}）`,
        });
      }
      
      if (startYear && startYear > new Date().getFullYear()) {
        issues.push({
          type: 'warning',
          section: 'education',
          index: idx,
          message: `${item.name || '教育经历'}：开始时间（${item.startDate}）在当前年份之后`,
        });
      }
      
      if (endYear && endYear > new Date().getFullYear() && !item.endDate.includes('至今')) {
        issues.push({
          type: 'warning',
          section: 'education',
          index: idx,
          message: `${item.name || '教育经历'}：结束时间（${item.endDate}）在当前年份之后，请确认`,
        });
      }
    }
    
    if (item.type === 'experience' || item.type === 'project') {
      if (startMonth && endMonth && startMonth > endMonth) {
        issues.push({
          type: 'error',
          section: item.type,
          index: idx,
          message: `${item.name || '经历'}：开始时间（${item.startDate}）晚于结束时间（${item.endDate}）`,
        });
      }
      
      if (startYear && startYear > new Date().getFullYear()) {
        issues.push({
          type: 'error',
          section: item.type,
          index: idx,
          message: `${item.name || '经历'}：开始时间（${item.startDate}）在当前年份之后`,
        });
      }
      
      if (startYear && endYear && endYear - startYear > 20) {
        issues.push({
          type: 'warning',
          section: item.type,
          index: idx,
          message: `${item.name || '经历'}：工作时间（${item.startDate} - ${item.endDate}）超过20年，请确认时间是否正确`,
        });
      }
      
      if (item.type === 'project' && startYear && endYear && endYear - startYear > 5) {
        issues.push({
          type: 'warning',
          section: item.type,
          index: idx,
          message: `${item.name || '项目'}：项目时间（${item.startDate} - ${item.endDate}）超过5年，请确认时间是否正确`,
        });
      }
    }
  });
  
  const experiences = items.filter(i => i.type === 'experience');
  for (let i = 0; i < experiences.length - 1; i++) {
    const current = experiences[i];
    const next = experiences[i + 1];
    
    const currentStart = parseYear(current.startDate) || 0;
    const currentEnd = parseYear(current.endDate) || 9999;
    const nextStart = parseYear(next.startDate) || 0;
    
    if (currentEnd > nextStart && currentStart < nextStart) {
      issues.push({
        type: 'warning',
        section: 'experience',
        index: i,
        message: `${current.name} 和 ${next.name} 的时间有重叠，请确认时间是否正确`,
      });
    }
  }
  
  return issues;
}

export interface FullValidationResult {
  spellingErrors: SpellingError[];
  timelineIssues: Array<{
    type: 'error' | 'warning';
    section: string;
    index: number;
    message: string;
  }>;
}

export function validateResume(
  resume: any
): FullValidationResult {
  const allText = [
    resume.sections?.basic?.summary || '',
    ...(resume.sections?.education || []).map((e: any) => `${e.school || ''} ${e.degree || ''} ${e.major || ''}`),
    ...(resume.sections?.experience || []).map((e: any) => `${e.company || ''} ${e.position || ''} ${e.description || ''}`),
    ...(resume.sections?.projects || []).map((p: any) => `${p.name || ''} ${p.role || ''} ${p.description || ''}`),
  ].join(' ');
  
  const timelineItems: TimelineItem[] = [
    ...(resume.sections?.education || []).map((e: any) => ({
      type: 'education' as const,
      name: e.school || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
    })),
    ...(resume.sections?.experience || []).map((e: any) => ({
      type: 'experience' as const,
      name: e.company || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
    })),
    ...(resume.sections?.projects || []).map((p: any) => ({
      type: 'project' as const,
      name: p.name || '',
      startDate: p.startDate || '',
      endDate: p.endDate || '',
    })),
  ];
  
  return {
    spellingErrors: checkSpelling(allText),
    timelineIssues: validateTimeline(timelineItems),
  };
}
