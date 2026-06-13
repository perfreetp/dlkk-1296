import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Tag } from '@/components/common/Tag';
import { useResumeStore } from '@/stores/resumeStore';
import { analyzeJobMatch } from '@/services/analyzerService';
import { clsx } from 'clsx';

export default function MatchPage() {
  const navigate = useNavigate();
  const { currentResume } = useResumeStore();
  
  const [jobPosition, setJobPosition] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleAnalyze = async () => {
    if (!jobPosition.trim()) {
      setError('请输入目标岗位描述');
      return;
    }
    
    if (!currentResume) {
      setError('请先导入简历');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await analyzeJobMatch(currentResume, jobPosition);
      setAnalysis(result);
    } catch (err) {
      setError('分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          职位匹配分析
        </h1>
        <p className="text-gray-600">
          输入目标岗位，AI 分析简历与岗位的匹配度，并给出优化建议
        </p>
      </div>
      
      <Card className="mb-6">
        <Input
          label="目标岗位描述"
          placeholder="粘贴目标岗位的职位描述（包含职责和要求），例如：招聘后端开发工程师，要求熟练掌握 Java、Spring Boot，有微服务开发经验..."
          value={jobPosition}
          onChange={(e) => setJobPosition(e.target.value)}
          size="lg"
        />
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/')}>
            返回
          </Button>
          <Button
            variant="primary"
            onClick={handleAnalyze}
            disabled={loading || !jobPosition.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                开始分析
              </>
            )}
          </Button>
        </div>
      </Card>
      
      {analysis && (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4">匹配度评分</h3>
              <div className="flex items-center justify-center">
                <div className={clsx('p-8 rounded-full border-4', getScoreBg(analysis.matchScore))}>
                  <div className={clsx('text-5xl font-bold', getScoreColor(analysis.matchScore))}>
                    {analysis.matchScore}%
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                {analysis.matchScore >= 70
                  ? '🎉 匹配度较高，继续保持优势！'
                  : analysis.matchScore >= 40
                  ? '💪 匹配度中等，建议针对性优化'
                  : '📚 匹配度较低，需要重点提升'}
              </div>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4">关键词统计</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-2">技术关键词</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords
                      .filter((k: any) => k.category === '技术')
                      .slice(0, 8)
                      .map((keyword: any) => (
                        <Tag key={keyword.word} label={keyword.word} color="blue" />
                      ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">软技能</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords
                      .filter((k: any) => k.category === '软技能')
                      .slice(0, 6)
                      .map((keyword: any) => (
                        <Tag key={keyword.word} label={keyword.word} color="green" />
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {analysis.missingKeywords.length > 0 && (
            <Card className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                缺失的关键词
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                以下关键词在岗位描述中出现，但你的简历中未包含：
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {analysis.missingKeywords.map((keyword: string) => (
                  <Tag key={keyword} label={keyword} color="red" />
                ))}
              </div>
            </Card>
          )}
          
          {analysis.suggestions.length > 0 && (
            <Card className="mb-6">
              <h3 className="text-lg font-semibold mb-4">优化建议</h3>
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={() => navigate('/')}>
              重新导入
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/edit')}
            >
              开始优化
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
