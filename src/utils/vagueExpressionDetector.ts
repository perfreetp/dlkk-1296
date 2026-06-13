import type { VagueExpression } from '@/types/common';
import type { Resume } from '@/types/resume';

interface VaguePattern {
  pattern: RegExp;
  label: string;
  suggestion: string;
}

const VAGUE_PATTERNS: VaguePattern[] = [
  {
    pattern: /负责[\s\S]{0,30}工作?/,
    label: '职责描述过于笼统',
    suggestion: '建议添加具体职责范围和量化成果',
  },
  {
    pattern: /参与[\s\S]{0,30}/,
    label: '参与角色不明确',
    suggestion: '说明你在项目中的具体贡献和个人成果',
  },
  {
    pattern: /表现优秀|工作认真|积极配合|态度端正|责任心强/,
    label: '主观评价',
    suggestion: '用具体事例或数据替代主观描述',
  },
  {
    pattern: /熟练掌握/,
    label: '程度词模糊',
    suggestion: '建议用实际项目经验证明技能水平',
  },
  {
    pattern: /精通/,
    label: '程度词过强',
    suggestion: '除非真正精通，否则建议改为"熟练掌握"',
  },
  {
    pattern: /了解|熟悉/,
    label: '程度较弱',
    suggestion: '如果只是了解，建议明确说明了解的程度',
  },
  {
    pattern: /完成|做完|做了/,
    label: '动词过于简单',
    suggestion: '建议用更专业的动词，如"开发"、"实现"、"优化"',
  },
  {
    pattern: /学习|学会/,
    label: '学习成果未体现',
    suggestion: '说明学习后取得的成果或掌握的技能',
  },
  {
    pattern: /帮助|协助/,
    label: '贡献不够具体',
    suggestion: '具体说明帮助解决了什么问题',
  },
  {
    pattern: /相关工作|相关经验/,
    label: '表述模糊',
    suggestion: '明确说明具体是哪些工作或经验',
  },
];

function findMatchRange(text: string, pattern: RegExp): [number, number] {
  const match = text.match(pattern);
  if (!match || !match.index) return [0, 0];
  
  return [match.index, match.index + match[0].length];
}

export function detectVagueExpressions(resume: Resume): VagueExpression[] {
  const expressions: VagueExpression[] = [];
  
  resume.sections.experience.forEach((exp, idx) => {
    VAGUE_PATTERNS.forEach(({ pattern, label, suggestion }) => {
      if (pattern.test(exp.description)) {
        expressions.push({
          section: 'experience',
          index: idx,
          text: exp.description,
          label,
          suggestion,
          range: findMatchRange(exp.description, pattern),
        });
      }
    });
    
    exp.highlights.forEach((highlight, hIdx) => {
      VAGUE_PATTERNS.forEach(({ pattern, label, suggestion }) => {
        if (pattern.test(highlight)) {
          expressions.push({
            section: 'experience-highlights',
            index: idx,
            text: highlight,
            label,
            suggestion,
            range: findMatchRange(highlight, pattern),
          });
        }
      });
    });
  });
  
  resume.sections.projects.forEach((project, idx) => {
    VAGUE_PATTERNS.forEach(({ pattern, label, suggestion }) => {
      if (pattern.test(project.description)) {
        expressions.push({
          section: 'project',
          index: idx,
          text: project.description,
          label,
          suggestion,
          range: findMatchRange(project.description, pattern),
        });
      }
    });
  });
  
  return expressions;
}

export function highlightVagueExpressions(text: string): { text: string; isVague: boolean }[] {
  const result: { text: string; isVague: boolean }[] = [];
  let lastIndex = 0;
  
  const matches: Array<{ start: number; end: number }> = [];
  
  VAGUE_PATTERNS.forEach(({ pattern }) => {
    let match;
    const regex = new RegExp(pattern.source, 'g');
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  });
  
  matches.sort((a, b) => a.start - b.start);
  
  matches.forEach(match => {
    if (match.start >= lastIndex) {
      if (match.start > lastIndex) {
        result.push({
          text: text.slice(lastIndex, match.start),
          isVague: false,
        });
      }
      result.push({
        text: text.slice(match.start, match.end),
        isVague: true,
      });
      lastIndex = match.end;
    }
  });
  
  if (lastIndex < text.length) {
    result.push({
      text: text.slice(lastIndex),
      isVague: false,
    });
  }
  
  return result;
}
