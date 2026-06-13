import type { SpellingError } from '@/types/common';

const COMMON_TYPOS: Record<string, string> = {
  '编程': '编程',
  '程序': '程序',
  '开发': '开发',
  '系统': '系统',
  '负责': '负责',
  '管理': '管理',
  '设计': '设计',
  '实现': '实现',
  '优化': '优化',
  '测试': '测试',
  '部署': '部署',
  '维护': '维护',
  '分析': '分析',
  '数据': '数据',
  '用户': '用户',
  '产品': '产品',
  '项目': '项目',
  '团队': '团队',
  '公司': '公司',
  '经验': '经验',
};

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

export function validateTimeline(
  education: Array<{ startDate: string; endDate: string; school: string }>,
  experience: Array<{ startDate: string; endDate: string; company: string }>,
  projects: Array<{ startDate: string; endDate: string; name: string }>
): Array<{
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
  
  education.forEach((edu, idx) => {
    const startYear = parseYear(edu.startDate);
    const endYear = parseYear(edu.endDate);
    
    if (startYear && endYear && startYear > endYear) {
      issues.push({
        type: 'error',
        section: 'education',
        index: idx,
        message: `${edu.school || '教育经历'}：开始时间（${edu.startDate}）晚于结束时间（${edu.endDate}）`,
      });
    }
    
    if (startYear && startYear > new Date().getFullYear()) {
      issues.push({
        type: 'warning',
        section: 'education',
        index: idx,
        message: `${edu.school || '教育经历'}：开始时间（${edu.startDate}）在当前年份之后`,
      });
    }
    
    if (endYear && endYear > new Date().getFullYear() && !edu.endDate.includes('至今')) {
      issues.push({
        type: 'warning',
        section: 'education',
        index: idx,
        message: `${edu.school || '教育经历'}：毕业时间（${edu.endDate}）在当前年份之后，请确认`,
      });
    }
  });
  
  experience.forEach((exp, idx) => {
    const startYear = parseYear(exp.startDate);
    const endYear = parseYear(exp.endDate);
    const startMonth = parseMonth(exp.startDate);
    const endMonth = parseMonth(exp.endDate);
    
    if (startMonth && endMonth && startMonth > endMonth) {
      issues.push({
        type: 'error',
        section: 'experience',
        index: idx,
        message: `${exp.company || '工作经历'}：开始时间（${exp.startDate}）晚于结束时间（${exp.endDate}）`,
      });
    }
    
    if (startYear && startYear > new Date().getFullYear()) {
      issues.push({
        type: 'error',
        section: 'experience',
        index: idx,
        message: `${exp.company || '工作经历'}：开始时间（${exp.startDate}）在当前年份之后`,
      });
    }
    
    if (startYear && endYear && endYear - startYear > 20) {
      issues.push({
        type: 'warning',
        section: 'experience',
        index: idx,
        message: `${exp.company || '工作经历'}：工作时间（${exp.startDate} - ${exp.endDate}）超过20年，请确认时间是否正确`,
      });
    }
  });
  
  projects.forEach((proj, idx) => {
    const startYear = parseYear(proj.startDate);
    const endYear = parseYear(proj.endDate);
    const startMonth = parseMonth(proj.startDate);
    const endMonth = parseMonth(proj.endDate);
    
    if (startMonth && endMonth && startMonth > endMonth) {
      issues.push({
        type: 'error',
        section: 'project',
        index: idx,
        message: `${proj.name || '项目'}：开始时间（${proj.startDate}）晚于结束时间（${proj.endDate}）`,
      });
    }
    
    if (startYear && endYear && endYear - startYear > 5) {
      issues.push({
        type: 'warning',
        section: 'project',
        index: idx,
        message: `${proj.name || '项目'}：项目时间（${proj.startDate} - ${proj.endDate}）超过5年，请确认时间是否正确`,
      });
    }
  });
  
  const allItems = [
    ...education.map(e => ({ ...e, type: 'education', parseYear })),
    ...experience.map(e => ({ ...e, type: 'experience', parseYear })),
    ...projects.map(p => ({ ...p, type: 'project', parseYear })),
  ];
  
  allItems.sort((a, b) => {
    const aYear = a.parseYear(a.startDate) || 0;
    const bYear = b.parseYear(b.startDate) || 0;
    return bYear - aYear;
  });
  
  for (let i = 0; i < allItems.length - 1; i++) {
    const current = allItems[i];
    const next = allItems[i + 1];
    
    const currentEnd = current.parseYear(current.endDate) || 9999;
    const nextEnd = next.parseYear(next.endDate) || 9999;
    
    if (current.type === 'experience' && next.type === 'experience') {
      const currentStart = current.parseYear(current.startDate) || 0;
      const nextStart = next.parseYear(next.startDate) || 0;
      
      if (currentEnd > nextStart && currentStart < nextEnd) {
        const currentName = 'company' in current ? current.company : current.name || '经历';
        const nextName = 'company' in next ? next.company : next.name || '经历';
        
        issues.push({
          type: 'warning',
          section: current.type,
          index: i,
          message: `${currentName} 和 ${nextName} 的时间有重叠，请确认时间是否正确`,
        });
      }
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
  resume: {
    sections: {
      education: Array<{ startDate: string; endDate: string; school: string }>;
      experience: Array<{ startDate: string; endDate: string; company: string }>;
      projects: Array<{ startDate: string; endDate: string; name: string }>;
    };
  }
): FullValidationResult {
  const allText = [
    resume.sections.basic?.summary || '',
    ...resume.sections.education.map(e => `${e.school} ${e.degree || ''} ${e.major || ''}`),
    ...resume.sections.experience.map(e => `${e.company} ${e.position || ''} ${e.description || ''}`),
    ...resume.sections.projects.map(p => `${p.name} ${p.role || ''} ${p.description || ''}`),
  ].join(' ');
  
  return {
    spellingErrors: checkSpelling(allText),
    timelineIssues: validateTimeline(
      resume.sections.education,
      resume.sections.experience,
      resume.sections.projects
    ),
  };
}
