import type { Keyword } from '@/types/common';
import type { Resume } from '@/types/resume';
import { extractKeywords, calculateMatchScore, findMissingKeywords } from '@/utils/keywordExtractor';

export interface KeywordAnalysis {
  keywords: Keyword[];
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
}

function generateSuggestions(missingKeywords: string[]): string[] {
  return missingKeywords.slice(0, 5).map(keyword => {
    if (extractTechKeywords().includes(keyword)) {
      return `建议在技能或项目描述中添加"${keyword}"相关内容`;
    }
    return `考虑在简历中加入与"${keyword}"相关的经历或技能`;
  });
}

function extractTechKeywords(): string[] {
  return [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Python', 'Java',
    'SQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'CSS', 'HTML',
  ];
}

function resumeToText(resume: Resume): string {
  const parts: string[] = [];
  
  parts.push(resume.sections.basic.summary);
  
  resume.sections.experience.forEach(exp => {
    parts.push(exp.description);
    parts.push(...exp.highlights);
  });
  
  resume.sections.projects.forEach(proj => {
    parts.push(proj.description);
    parts.push(...proj.technologies);
  });
  
  resume.sections.skills.forEach(skill => {
    parts.push(skill.name);
  });
  
  return parts.join(' ');
}

export async function analyzeJobMatch(
  resume: Resume,
  jobDescription: string
): Promise<KeywordAnalysis> {
  const resumeText = resumeToText(resume);
  
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobDescription);
  
  const matchScore = calculateMatchScore(resumeKeywords, jobKeywords);
  const missingKeywords = findMissingKeywords(jobKeywords, resumeKeywords);
  const suggestions = generateSuggestions(missingKeywords);
  
  return {
    keywords: jobKeywords,
    matchScore,
    missingKeywords,
    suggestions,
  };
}

export function extractJobKeywords(jobDescription: string): Keyword[] {
  return extractKeywords(jobDescription);
}
