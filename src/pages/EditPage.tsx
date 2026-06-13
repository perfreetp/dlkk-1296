import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Download, GitCompare, AlertTriangle, Lightbulb, Clock, SpellCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input, Textarea } from '@/components/common/Input';
import { Tag } from '@/components/common/Tag';
import { useResumeStore } from '@/stores/resumeStore';
import { optimizeResume, validateResumeFull } from '@/services/optimizerService';
import { exportToPDF } from '@/services/exportService';
import { resumeToHtml } from '@/utils/textParser';
import { clsx } from 'clsx';

export default function EditPage() {
  const navigate = useNavigate();
  const { currentResume, updateSection, saveVersion } = useResumeStore();
  
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'vague' | 'quantify' | 'spelling' | 'timeline'>('vague');
  
  useEffect(() => {
    if (currentResume) {
      const optResult = optimizeResume(currentResume);
      setOptimizationResult(optResult);
      
      const valResult = validateResumeFull(currentResume);
      setValidationResult(valResult);
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
      
      <div className="mb-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('vague')}
            className={clsx(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'vague'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            <AlertTriangle className="w-4 h-4 inline-block mr-1" />
            空泛表达 ({optimizationResult?.vagueExpressions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('quantify')}
            className={clsx(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'quantify'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            <Lightbulb className="w-4 h-4 inline-block mr-1" />
            量化建议 ({optimizationResult?.quantifySuggestions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('spelling')}
            className={clsx(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'spelling'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            <SpellCheck className="w-4 h-4 inline-block mr-1" />
            错别字 ({validationResult?.spellingErrors?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={clsx(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            <Clock className="w-4 h-4 inline-block mr-1" />
            时间线 ({validationResult?.timelineIssues?.length || 0})
          </button>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
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
          
          <Card title={clsx(
            "教育背景",
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({currentResume.sections.education.length} 条)
            </span>
          )}>
            {currentResume.sections.education.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无教育背景信息</p>
            ) : (
              currentResume.sections.education.map((edu, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <Input
                      label="学校"
                      value={edu.school}
                      onChange={(e) => {
                        const newEdu = [...currentResume.sections.education];
                        newEdu[index] = { ...edu, school: e.target.value };
                        updateSection('education', newEdu);
                      }}
                    />
                    <Input
                      label="学位"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...currentResume.sections.education];
                        newEdu[index] = { ...edu, degree: e.target.value };
                        updateSection('education', newEdu);
                      }}
                    />
                    <Input
                      label="专业"
                      value={edu.major}
                      onChange={(e) => {
                        const newEdu = [...currentResume.sections.education];
                        newEdu[index] = { ...edu, major: e.target.value };
                        updateSection('education', newEdu);
                      }}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="开始时间"
                        value={edu.startDate}
                        onChange={(e) => {
                          const newEdu = [...currentResume.sections.education];
                          newEdu[index] = { ...edu, startDate: e.target.value };
                          updateSection('education', newEdu);
                        }}
                      />
                      <Input
                        label="结束时间"
                        value={edu.endDate}
                        onChange={(e) => {
                          const newEdu = [...currentResume.sections.education];
                          newEdu[index] = { ...edu, endDate: e.target.value };
                          updateSection('education', newEdu);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
          
          <Card title={clsx(
            "工作经历",
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({currentResume.sections.experience.length} 条)
            </span>
          )}>
            {currentResume.sections.experience.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无工作经历信息</p>
            ) : (
              currentResume.sections.experience.map((exp, index) => (
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
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="开始时间"
                        value={exp.startDate}
                        onChange={(e) => {
                          const newExp = [...currentResume.sections.experience];
                          newExp[index] = { ...exp, startDate: e.target.value };
                          updateSection('experience', newExp);
                        }}
                      />
                      <Input
                        label="结束时间"
                        value={exp.endDate}
                        onChange={(e) => {
                          const newExp = [...currentResume.sections.experience];
                          newExp[index] = { ...exp, endDate: e.target.value };
                          updateSection('experience', newExp);
                        }}
                      />
                    </div>
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
              ))
            )}
          </Card>
          
          <Card title={clsx(
            "项目经历",
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({currentResume.sections.projects.length} 条)
            </span>
          )}>
            {currentResume.sections.projects.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无项目经历信息</p>
            ) : (
              currentResume.sections.projects.map((proj, index) => (
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
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="开始时间"
                        value={proj.startDate}
                        onChange={(e) => {
                          const newProj = [...currentResume.sections.projects];
                          newProj[index] = { ...proj, startDate: e.target.value };
                          updateSection('projects', newProj);
                        }}
                      />
                      <Input
                        label="结束时间"
                        value={proj.endDate}
                        onChange={(e) => {
                          const newProj = [...currentResume.sections.projects];
                          newProj[index] = { ...proj, endDate: e.target.value };
                          updateSection('projects', newProj);
                        }}
                      />
                    </div>
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
              ))
            )}
          </Card>
          
          <Card title={clsx(
            "技能",
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({currentResume.sections.skills.length} 条)
            </span>
          )}>
            {currentResume.sections.skills.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无技能信息</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentResume.sections.skills.map((skill, index) => (
                  <Tag
                    key={index}
                    label={`${skill.name} (${skill.level})`}
                    color="blue"
                  />
                ))}
              </div>
            )}
          </Card>
          
          <Button variant="primary" size="lg" onClick={handleExportPDF}>
            <Download className="w-5 h-5 mr-2" />
            导出 PDF
          </Button>
        </div>
        
        <div className="space-y-6">
          {activeTab === 'vague' && optimizationResult && optimizationResult.vagueExpressions.length > 0 && (
            <Card title="空泛表达检测">
              <div className="space-y-3">
                {optimizationResult.vagueExpressions.slice(0, 10).map((expr: any, index: number) => (
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
              {optimizationResult.vagueExpressions.length > 10 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  还有 {optimizationResult.vagueExpressions.length - 10} 条未显示
                </p>
              )}
            </Card>
          )}
          
          {activeTab === 'quantify' && optimizationResult && optimizationResult.quantifySuggestions.length > 0 && (
            <Card title="量化改写建议">
              <div className="space-y-3">
                {optimizationResult.quantifySuggestions.slice(0, 10).map((suggestion: any, index: number) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm font-medium text-gray-900">改写建议</div>
                    </div>
                    <div className="text-xs text-gray-700 mb-2">原文：{suggestion.original}</div>
                    <div className="text-xs text-green-700 font-medium">示例：{suggestion.example}</div>
                  </div>
                ))}
              </div>
              {optimizationResult.quantifySuggestions.length > 10 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  还有 {optimizationResult.quantifySuggestions.length - 10} 条未显示
                </p>
              )}
            </Card>
          )}
          
          {activeTab === 'spelling' && validationResult && validationResult.spellingErrors.length > 0 && (
            <Card title="错别字检测">
              <div className="space-y-3">
                {validationResult.spellingErrors.slice(0, 10).map((error: any, index: number) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-2 mb-2">
                      <SpellCheck className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm font-medium text-gray-900">可能的错别字</div>
                    </div>
                    <div className="text-xs text-red-700 mb-1">
                      <span className="font-medium">检测到：</span>{error.text}
                    </div>
                    <div className="text-xs text-green-700">
                      <span className="font-medium">建议改为：</span>{error.suggestion}
                    </div>
                  </div>
                ))}
              </div>
              {validationResult.spellingErrors.length > 10 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  还有 {validationResult.spellingErrors.length - 10} 条未显示
                </p>
              )}
              {validationResult.spellingErrors.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <SpellCheck className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">未检测到错别字</p>
                </div>
              )}
            </Card>
          )}
          
          {activeTab === 'timeline' && validationResult && (
            <Card title="时间线校验">
              {validationResult.timelineIssues.length > 0 ? (
                <div className="space-y-3">
                  {validationResult.timelineIssues.slice(0, 10).map((issue: any, index: number) => (
                    <div
                      key={index}
                      className={clsx(
                        'p-3 rounded-lg border',
                        issue.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Clock className={clsx(
                          'w-4 h-4 mt-0.5 flex-shrink-0',
                          issue.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                        )} />
                        <div className="flex-1">
                          <div className={clsx(
                            'text-sm font-medium',
                            issue.type === 'error' ? 'text-red-900' : 'text-yellow-900'
                          )}>
                            {issue.type === 'error' ? '时间错误' : '时间警告'}
                          </div>
                          <div className={clsx(
                            'text-xs mt-1',
                            issue.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                          )}>
                            {issue.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">时间线校验通过</p>
                </div>
              )}
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
