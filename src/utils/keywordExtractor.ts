import type { Keyword } from '@/types/common';

const STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'and', 'or', 'but', 'if', 'then', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
]);

const TECH_KEYWORDS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
  'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux',
  'CSS', 'HTML', 'REST API', 'GraphQL', 'WebSocket',
  'Agile', 'Scrum', 'CI/CD', 'DevOps',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'Data Analysis', 'Data Visualization', 'Big Data', 'Hadoop', 'Spark',
  'Microservices', 'Serverless', 'Microservice Architecture',
  'Test-Driven Development', 'Unit Testing', 'Integration Testing',
  'Design Patterns', 'SOLID Principles', 'Clean Code',
];

const SOFT_SKILLS = [
  '领导力', '沟通能力', '团队合作', '问题解决', '创新能力', '时间管理',
  'critical thinking', 'problem solving', 'teamwork', 'communication', 'leadership',
  'adaptability', 'time management', 'creativity',
];

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
}

function countFrequency(words: string[]): Map<string, number> {
  const freqMap = new Map<string, number>();
  
  words.forEach(word => {
    freqMap.set(word, (freqMap.get(word) || 0) + 1);
  });
  
  return freqMap;
}

function isTechKeyword(word: string): boolean {
  const lowerWord = word.toLowerCase();
  return TECH_KEYWORDS.some(keyword =>
    keyword.toLowerCase().includes(lowerWord) ||
    lowerWord.includes(keyword.toLowerCase())
  );
}

function isSoftSkill(word: string): boolean {
  const lowerWord = word.toLowerCase();
  return SOFT_SKILLS.some(skill =>
    skill.toLowerCase().includes(lowerWord) ||
    lowerWord.includes(skill.toLowerCase())
  );
}

export function extractKeywords(text: string): Keyword[] {
  const words = tokenize(text);
  const filtered = words.filter(w => !STOP_WORDS.has(w) && w.length > 1);
  const freqMap = countFrequency(filtered);
  
  const keywords: Keyword[] = [];
  
  freqMap.forEach((score, word) => {
    let category: '技术' | '软技能' | '职责' = '职责';
    
    if (isTechKeyword(word)) {
      category = '技术';
    } else if (isSoftSkill(word)) {
      category = '软技能';
    }
    
    keywords.push({ word, score, category });
  });
  
  return keywords
    .filter(k => k.score > 1 || k.category === '技术')
    .sort((a, b) => b.score - a.score);
}

export function calculateMatchScore(resumeKeywords: Keyword[], jobKeywords: Keyword[]): number {
  if (jobKeywords.length === 0) return 0;
  
  const resumeWords = new Set(resumeKeywords.map(k => k.word.toLowerCase()));
  
  let matched = 0;
  jobKeywords.forEach(keyword => {
    if (resumeWords.has(keyword.word.toLowerCase())) {
      matched++;
    }
  });
  
  return Math.round((matched / jobKeywords.length) * 100);
}

export function findMissingKeywords(jobKeywords: Keyword[], resumeKeywords: Keyword[]): string[] {
  const resumeWords = new Set(resumeKeywords.map(k => k.word.toLowerCase()));
  
  return jobKeywords
    .filter(keyword => !resumeWords.has(keyword.word.toLowerCase()))
    .map(keyword => keyword.word);
}
