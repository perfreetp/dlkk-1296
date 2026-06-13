export interface Keyword {
  word: string;
  score: number;
  category: '技术' | '软技能' | '职责';
}

export interface VagueExpression {
  section: string;
  index: number;
  text: string;
  label: string;
  suggestion: string;
  range: [number, number];
}

export interface QuantifySuggestion {
  original: string;
  suggestions: string[];
  example: string;
}

export interface SpellingError {
  text: string;
  position: number;
  suggestion: string;
}

export interface OptimizationResult {
  vagueExpressions: VagueExpression[];
  quantifySuggestions: QuantifySuggestion[];
  spellingErrors: SpellingError[];
}

export interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  content: string;
  lineNumber?: number;
}
