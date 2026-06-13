import type { DiffResult } from '@/types/common';
import type { Resume } from '@/types/resume';

function resumeToText(resume: Resume): string {
  const parts: string[] = [];
  
  if (resume.sections.basic.name) {
    parts.push(`姓名: ${resume.sections.basic.name}`);
  }
  if (resume.sections.basic.email) {
    parts.push(`邮箱: ${resume.sections.basic.email}`);
  }
  if (resume.sections.basic.phone) {
    parts.push(`电话: ${resume.sections.basic.phone}`);
  }
  if (resume.sections.basic.summary) {
    parts.push(`\n个人简介:\n${resume.sections.basic.summary}`);
  }
  
  if (resume.sections.education.length > 0) {
    parts.push('\n教育背景:');
    resume.sections.education.forEach(edu => {
      parts.push(`${edu.school} - ${edu.degree} ${edu.major} (${edu.startDate} - ${edu.endDate})`);
    });
  }
  
  if (resume.sections.experience.length > 0) {
    parts.push('\n工作经历:');
    resume.sections.experience.forEach(exp => {
      parts.push(`${exp.company} - ${exp.position} (${exp.startDate} - ${exp.endDate})`);
      parts.push(exp.description);
      if (exp.highlights.length > 0) {
        parts.push(...exp.highlights.map(h => `• ${h}`));
      }
    });
  }
  
  if (resume.sections.projects.length > 0) {
    parts.push('\n项目经历:');
    resume.sections.projects.forEach(proj => {
      parts.push(`${proj.name} - ${proj.role} (${proj.startDate} - ${proj.endDate})`);
      parts.push(proj.description);
      if (proj.technologies.length > 0) {
        parts.push(`技术栈: ${proj.technologies.join(', ')}`);
      }
    });
  }
  
  if (resume.sections.skills.length > 0) {
    parts.push('\n技能:');
    resume.sections.skills.forEach(skill => {
      parts.push(`${skill.name} (${skill.level})`);
    });
  }
  
  return parts.join('\n');
}

function computeLCS(arr1: string[], arr2: string[]): number[][] {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp;
}

function backtrack(
  dp: number[][],
  arr1: string[],
  arr2: string[],
  i: number,
  j: number,
  result: DiffResult[]
): void {
  if (i === 0 && j === 0) return;
  
  if (i === 0) {
    result.unshift({ type: 'added', content: arr2[j - 1], lineNumber: j });
    backtrack(dp, arr1, arr2, i, j - 1, result);
  } else if (j === 0) {
    result.unshift({ type: 'removed', content: arr1[i - 1], lineNumber: i });
    backtrack(dp, arr1, arr2, i - 1, j, result);
  } else if (arr1[i - 1] === arr2[j - 1]) {
    result.unshift({ type: 'unchanged', content: arr1[i - 1], lineNumber: i });
    backtrack(dp, arr1, arr2, i - 1, j - 1, result);
  } else if (dp[i - 1][j] >= dp[i][j - 1]) {
    result.unshift({ type: 'removed', content: arr1[i - 1], lineNumber: i });
    backtrack(dp, arr1, arr2, i - 1, j, result);
  } else {
    result.unshift({ type: 'added', content: arr2[j - 1], lineNumber: j });
    backtrack(dp, arr1, arr2, i, j - 1, result);
  }
}

export function compareVersions(original: Resume, optimized: Resume): DiffResult[] {
  const originalText = resumeToText(original);
  const optimizedText = resumeToText(optimized);
  
  const originalLines = originalText.split('\n').filter(line => line.trim());
  const optimizedLines = optimizedText.split('\n').filter(line => line.trim());
  
  const dp = computeLCS(originalLines, optimizedLines);
  
  const result: DiffResult[] = [];
  backtrack(dp, originalLines, optimizedLines, originalLines.length, optimizedLines.length, result);
  
  return result.filter(diff => diff.content.trim());
}

export function calculateDiffStats(diffs: DiffResult[]): {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
} {
  return diffs.reduce(
    (acc, diff) => {
      acc[diff.type]++;
      return acc;
    },
    { added: 0, removed: 0, modified: 0, unchanged: 0 }
  );
}

export function applyChanges(original: Resume, changes: Map<number, string>): Resume {
  const updated = { ...original };
  
  return updated;
}
