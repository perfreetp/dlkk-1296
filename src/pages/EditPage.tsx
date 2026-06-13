import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Download, GitCompare, AlertTriangle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input, Textarea } from '@/components/common/Input';
import { Tag } from '@/components/common/Tag';
import { useResumeStore } from '@/stores/resumeStore';
import { optimizeResume } from '@/services/optimizerService';
import { exportToPDF } from '@/services/exportService';
import { resumeToHtml } from '@/utils/textParser';
import { highlightVagueExpressions } from '@/utils/vagueExpressionDetector';
import { clsx } from 'clsx';

export default function EditPage() {
  const navigate = useNavigate();
  const { currentResume, updateSection, saveVersion } = useResumeStore();
  
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  
  useEffect(() => {
    if (currentResume) {
      const result = optimizeResume(currentResume);
      setOptimizationResult(result);
    }
  }, [currentResume]);
  
  const handleSaveVersion = () => {
    const name = prompt('请输入版本名称：', '优化版');
    if (name) {
      saveVersion(name);
      alert('版本保存成功！');
    }
  };
  
  const handleExportPDF = () => {
    if (!currentResume) return;
    
    try {
      const html = resumeToHtml(currentResume);
      exportToPDF(html, `${currentResume.sections.basic.name || '简历'}.pdf`);
    } catch (error) {
      alert('导出失败，请重试');
    }
  };
  
  if (!currentResume) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">暂无简历</h2>
        <p className="text-gray-600 mb-6">请先导入简历</p>
        <Button onClick={() => navigate('/')}>去导入</Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">优化编辑</h1>
          <p className="text-gray-600 mt-1">优化简历内容，提升表达质量</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/')}>
            返回
          </Button>
          <Button variant="secondary" onClick={handleSaveVersion}>
            <Save className="w-4 h-4 mr-2" />
            保存版本
          </Button>
          <Button variant="primary" onClick={() => navigate('/compare')}>
            <GitCompare className="w-4 h-4 mr-2" />
            版本对比
          </Button>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="基本信息">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="姓名"
                value={currentResume.sections.basic.name}
                onChange={(e) => updateSection('basic', { ...currentResume.sections.basic, name: e.target.value })}
              />
              <Input
                label="邮箱"
                type="email"
                value={currentResume.sections.basic.email}
                onChange={(e) => updateSection('basic', { ...currentResume.sections.basic, email: e.target.value })}
              />
              <Input
                label="电话"
                value={currentResume.sections.basic.phone}
                onChange={(e) => updateSection('basic', { ...currentResume.sections.basic, phone: e.target.value })}
              />
              <Input
                label="地址"
                value={currentResume.sections.basic.location}
                onChange={(e) => updateSection('basic', { ...currentResume.sections.basic, location: e.target.value })}
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="个人简介"
                value={currentResume.sections.basic.summary}
                onChange={(e) => updateSection('basic', { ...currentResume.sections.basic, summary: e.target.value })}
                rows={4}
              />
            </div>
          </Card>
          
          <Card title="工作经历">
            {currentResume.sections.experience.map((exp, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <Input
                    label="公司"
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...currentResume.sections.experience];
                      newExp[index] = { ...exp, company: e.target.value };
                      updateSection('experience', newExp);
                    }}
                  />
                  <Input
                    label="职位"
                    value={exp.position}
                    onChange={(e) => {
                      const newExp = [...currentResume.sections.experience];
                      newExp[index] = { ...exp, position: e.target.value };
                      updateSection('experience', newExp);
                    }}
                  />
                </div>
                <Textarea
                  label="工作描述"
                  value={exp.description}
                  onChange={(e) => {
                    const newExp = [...currentResume.sections.experience];
                    newExp[index] = { ...exp, description: e.target.value };
                    updateSection('experience', newExp);
                  }}
                  rows={3}
                />
              </div>
            ))}
          </Card>
          
          <Card title="项目经历">
            {currentResume.sections.projects.map((proj, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <Input
                    label="项目名称"
                    value={proj.name}
                    onChange={(e) => {
                      const newProj = [...currentResume.sections.projects];
                      newProj[index] = { ...proj, name: e.target.value };
                      updateSection('projects', newProj);
                    }}
                  />
                  <Input
                    label="项目角色"
                    value={proj.role}
                    onChange={(e) => {
                      const newProj = [...currentResume.sections.projects];
                      newProj[index] = { ...proj, role: e.target.value };
                      updateSection('projects', newProj);
                    }}
                  />
                </div>
                <Textarea
                  label="项目描述"
                  value={proj.description}
                  onChange={(e) => {
                    const newProj = [...currentResume.sections.projects];
                    newProj[index] = { ...proj, description: e.target.value };
                    updateSection('projects', newProj);
                  }}
                  rows={3}
                />
              </div>
            ))}
          </Card>
          
          <Button variant="primary" size="lg" onClick={handleExportPDF}>
            <Download className="w-5 h-5 mr-2" />
            导出 PDF
          </Button>
        </div>
        
        <div className="space-y-6">
          {optimizationResult && optimizationResult.vagueExpressions.length > 0 && (
            <Card title="空泛表达检测">
              <div className="space-y-3">
                {optimizationResult.vagueExpressions.slice(0, 5).map((expr: any, index: number) => (
                  <div
                    key={index}
                    className={clsx(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      selectedSuggestion === index
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-white border-gray-200 hover:border-yellow-300'
                    )}
                    onClick={() => setSelectedSuggestion(selectedSuggestion === index ? null : index)}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{expr.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{expr.text}</div>
                      </div>
                    </div>
                    
                    {selectedSuggestion === index && (
                      <div className="ml-6 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="text-xs text-blue-700">{expr.suggestion}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {optimizationResult && optimizationResult.quantifySuggestions.length > 0 && (
            <Card title="量化建议">
              <div className="space-y-3">
                {optimizationResult.quantifySuggestions.slice(0, 5).map((suggestion: any, index: number) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm font-medium text-gray-900">改写建议</div>
                    </div>
                    <div className="text-xs text-gray-700 mb-2">{suggestion.original}</div>
                    <div className="text-xs text-green-700 font-medium">{suggestion.example}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          <Card title="快速操作">
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/library')}>
                📚 打开素材库
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/delivery')}>
                📋 添加投递记录
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
