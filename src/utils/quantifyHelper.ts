import type { QuantifySuggestion, VagueExpression } from '@/types/common';
import type { Resume } from '@/types/resume';

const METRIC_TEMPLATES = [
  '效率提升{delay}%',
  '性能提高{delay}%',
  '加载时间缩短{delay}ms',
  '响应速度提升{delay}倍',
  '用户增长{delay}人',
  '日活用户达到{delay}人',
  '月活用户增长{delay}%',
  '转化率提升{delay}%',
  '成本降低{delay}元',
  '成本节约{delay}%',
  '代码量减少{delay}行',
  'Bug率下降{delay}%',
  '测试覆盖率{delay}%',
  '处理{delay}个请求/秒',
  '支持{delay}并发用户',
  '覆盖{delay}个模块',
  '优化了{delay}个核心流程',
  '用户满意度提升{delay}%',
  '团队效率提升{delay}%',
  '项目交付时间提前{delay}天',
];

const ACTION_VERBS = {
  '负责': ['主导', '独立完成', '负责开发', '负责设计'],
  '参与': ['协助开发', '配合完成', '贡献了', '参与了'],
  '完成': ['成功交付', '按期完成', '提前完成', '高质量完成'],
  '做了': ['完成了', '实现了', '开发了', '设计了'],
};

function generateMetric(value: number): string {
  const template = METRIC_TEMPLATES[Math.floor(Math.random() * METRIC_TEMPLATES.length)];
  return template.replace('{delay}', value.toString());
}

function suggestBetterVerbs(text: string): string[] {
  const suggestions: string[] = [];
  
  Object.entries(ACTION_VERBS).forEach(([key, values]) => {
    if (text.includes(key)) {
      suggestions.push(...values);
    }
  });
  
  return suggestions;
}

function createExample(expr: VagueExpression): string {
  const metrics = [
    '效率提升25%',
    '用户增长1000人',
    '成本降低30%',
    '处理500个案例',
    '覆盖10个模块',
    '性能提高40%',
  ];
  
  const baseText = expr.text.replace(/[，。、；；！？.!]/g, '').trim();
  
  const metric = metrics[Math.floor(Math.random() * metrics.length)];
  
  return `${baseText}，${metric}`;
}

export function generateQuantifySuggestions(
  resume: Resume,
  vagueExpr: VagueExpression[]
): QuantifySuggestion[] {
  return vagueExpr.map(expr => {
    const context = expr.text;
    const suggestions: string[] = [];
    
    if (expr.text.includes('负责') || expr.text.includes('参与')) {
      suggestions.push(...suggestBetterVerbs(expr.text));
    }
    
    if (!/[0-9]/.test(expr.text)) {
      suggestions.push(generateMetric(Math.floor(Math.random() * 50) + 10));
    }
    
    suggestions.push(createExample(expr));
    
    return {
      original: context,
      suggestions: [...new Set(suggestions)],
      example: createExample(expr),
    };
  });
}

export function quantifyHighlight(highlight: string): string {
  if (/[0-9]/.test(highlight)) {
    return highlight;
  }
  
  const verbs = suggestBetterVerbs(highlight);
  if (verbs.length > 0) {
    return highlight.replace(/负责|参与|完成|做了/, verbs[0]);
  }
  
  const quantified = generateMetric(Math.floor(Math.random() * 30) + 10);
  return `${highlight}，${quantified}`;
}

export function generateMetricsFromContext(context: string): string[] {
  const metrics: string[] = [];
  
  if (context.includes('用户') || context.includes('客户')) {
    metrics.push(generateMetric(Math.floor(Math.random() * 1000) + 100));
  }
  
  if (context.includes('性能') || context.includes('效率')) {
    metrics.push(generateMetric(Math.floor(Math.random() * 50) + 20));
  }
  
  if (context.includes('成本') || context.includes('预算')) {
    metrics.push(generateMetric(Math.floor(Math.random() * 50) + 10));
  }
  
  if (context.includes('代码') || context.includes('开发')) {
    metrics.push(generateMetric(Math.floor(Math.random() * 500) + 100));
  }
  
  return [...new Set(metrics)];
}
