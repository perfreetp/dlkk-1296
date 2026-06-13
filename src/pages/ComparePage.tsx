import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useResumeStore } from '@/stores/resumeStore';
import type { DiffResult } from '@/types/common';
import type { Resume } from '@/types/resume';
import { clsx } from 'clsx';

export default function ComparePage() {
  const navigate = useNavigate();
  const { currentResume, versions, setCurrentResume } = useResumeStore();
  
  const [leftVersionId, setLeftVersionId] = useState<string | null>(null);
  const [rightVersionId, setRightVersionId] = useState<string | null>(null);
  const [appliedChanges, setAppliedChanges] = useState<Set<number>>(new Set());
  const [appliedCount, setAppliedCount] = useState(0);
  
  useEffect(() => {
    if (versions.length > 0 && !rightVersionId) {
      setRightVersionId(versions[versions.length - 1].id);
    }
    if (currentResume && !leftVersionId) {
      setLeftVersionId('current');
    }
  }, [versions, currentResume]);
  
  const getVersionById = (id: string): Resume | null => {
    if (id === 'current') return currentResume;
    return versions.find(v => v.id === id)?.resume || null;
  };
  
  const getVersionName = (id: string): string => {
    if (id === 'current') return '当前版本';
    return versions.find(v => v.id === id)?.name || '未知版本';
  };
  
  const leftVersion = leftVersionId ? getVersionById(leftVersionId) : null;
  const rightVersion = rightVersionId ? getVersionById(rightVersionId) : null;
  
  const generateDiffs = (): DiffResult[] => {
    if (!leftVersion || !rightVersion) return [];
    
    const diffs: DiffResult[] = [];
    
    if (leftVersion.sections.basic.name !== rightVersion.sections.basic.name) {
      diffs.push({
        type: leftVersion.sections.basic.name ? 'removed' : 'added',
        content: `姓名: ${leftVersion.sections.basic.name || rightVersion.sections.basic.name}`,
      });
    }
    
    if (leftVersion.sections.basic.email !== rightVersion.sections.basic.email) {
      diffs.push({
        type: leftVersion.sections.basic.email ? 'removed' : 'added',
        content: `邮箱: ${leftVersion.sections.basic.email || rightVersion.sections.basic.email}`,
      });
    }
    
    if (leftVersion.sections.basic.summary !== rightVersion.sections.basic.summary) {
      diffs.push({
        type: 'modified',
        content: `个人简介: ${rightVersion.sections.basic.summary}`,
      });
    }
    
    const leftExpCount = leftVersion.sections.experience.length;
    const rightExpCount = rightVersion.sections.experience.length;
    
    if (leftExpCount !== rightExpCount) {
      diffs.push({
        type: rightExpCount > leftExpCount ? 'added' : 'removed',
        content: `工作经历: ${rightExpCount > leftExpCount ? '新增' : '删除'} ${Math.abs(rightExpCount - leftExpCount)} 条`,
      });
    }
    
    const maxExp = Math.max(leftExpCount, rightExpCount);
    for (let i = 0; i < maxExp; i++) {
      const leftExp = leftVersion.sections.experience[i];
      const rightExp = rightVersion.sections.experience[i];
      
      if (!leftExp && rightExp) {
        diffs.push({
          type: 'added',
          content: `新增工作: ${rightExp.company} - ${rightExp.position}`,
        });
      } else if (leftExp && !rightExp) {
        diffs.push({
          type: 'removed',
          content: `删除工作: ${leftExp.company} - ${leftExp.position}`,
        });
      } else if (leftExp && rightExp) {
        if (leftExp.company !== rightExp.company) {
          diffs.push({
            type: 'modified',
            content: `公司: ${rightExp.company} (原: ${leftExp.company})`,
          });
        }
        if (leftExp.position !== rightExp.position) {
          diffs.push({
            type: 'modified',
            content: `职位: ${rightExp.position} (原: ${leftExp.position})`,
          });
        }
        if (leftExp.description !== rightExp.description) {
          diffs.push({
            type: 'modified',
            content: `工作描述: ${rightExp.description}`,
          });
        }
      }
    }
    
    const leftProjCount = leftVersion.sections.projects.length;
    const rightProjCount = rightVersion.sections.projects.length;
    
    if (leftProjCount !== rightProjCount) {
      diffs.push({
        type: rightProjCount > leftProjCount ? 'added' : 'removed',
        content: `项目经历: ${rightProjCount > leftProjCount ? '新增' : '删除'} ${Math.abs(rightProjCount - leftProjCount)} 个项目`,
      });
    }
    
    const maxProj = Math.max(leftProjCount, rightProjCount);
    for (let i = 0; i < maxProj; i++) {
      const leftProj = leftVersion.sections.projects[i];
      const rightProj = rightVersion.sections.projects[i];
      
      if (!leftProj && rightProj) {
        diffs.push({
          type: 'added',
          content: `新增项目: ${rightProj.name}`,
        });
      } else if (leftProj && !rightProj) {
        diffs.push({
          type: 'removed',
          content: `删除项目: ${leftProj.name}`,
        });
      } else if (leftProj && rightProj) {
        if (leftProj.name !== rightProj.name) {
          diffs.push({
            type: 'modified',
            content: `项目名: ${rightProj.name} (原: ${leftProj.name})`,
          });
        }
        if (leftProj.description !== rightProj.description) {
          diffs.push({
            type: 'modified',
            content: `项目描述: ${rightProj.description}`,
          });
        }
      }
    }
    
    const leftSkillCount = leftVersion.sections.skills.length;
    const rightSkillCount = rightVersion.sections.skills.length;
    
    if (leftSkillCount !== rightSkillCount) {
      diffs.push({
        type: rightSkillCount > leftSkillCount ? 'added' : 'removed',
        content: `技能: ${rightSkillCount > leftSkillCount ? '新增' : '删除'} ${Math.abs(rightSkillCount - leftSkillCount)} 项技能`,
      });
    }
    
    return diffs;
  };
  
  const diffs = leftVersion && rightVersion ? generateDiffs() : [];
  
  const stats = {
    added: diffs.filter(d => d.type === 'added').length,
    removed: diffs.filter(d => d.type === 'removed').length,
    modified: diffs.filter(d => d.type === 'modified').length,
    unchanged: diffs.filter(d => d.type === 'unchanged').length,
  };
  
  const handleApplyAll = () => {
    if (!rightVersion) return;
    
    setCurrentResume({ ...rightVersion, updatedAt: new Date() });
    
    const newAppliedCount = appliedChanges.size + diffs.filter(d => d.type !== 'unchanged').length;
    setAppliedCount(newAppliedCount);
    
    alert(`已应用所有优化！共 ${newAppliedCount} 项修改已同步到当前版本。`);
    navigate('/edit');
  };
  
  const handleApplySingle = (index: number) => {
    const newApplied = new Set(appliedChanges);
    newApplied.add(index);
    setAppliedChanges(newApplied);
    setAppliedCount(newApplied.size);
  };
  
  const handleIgnoreSingle = (index: number) => {
    const newApplied = new Set(appliedChanges);
    newApplied.delete(index);
    setAppliedChanges(newApplied);
    setAppliedCount(newApplied.size);
  };
  
  const handleApplySelected = () => {
    if (!rightVersion || appliedChanges.size === 0) {
      alert('请先选择要应用的修改');
      return;
    }
    
    const mergedResume = { ...currentResume! };
    
    appliedChanges.forEach(idx => {
      const diff = diffs[idx];
      if (!diff) return;
      
      if (diff.content.startsWith('姓名:')) {
        mergedResume.sections.basic.name = diff.content.replace('姓名: ', '');
      } else if (diff.content.startsWith('邮箱:')) {
        mergedResume.sections.basic.email = diff.content.replace('邮箱: ', '');
      } else if (diff.content.startsWith('个人简介:')) {
        mergedResume.sections.basic.summary = diff.content.replace('个人简介: ', '');
      }
    });
    
    setCurrentResume({ ...mergedResume, updatedAt: new Date() });
    
    alert(`已应用 ${appliedChanges.size} 项修改到当前版本！`);
    navigate('/edit');
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">版本对比</h1>
          <p className="text-gray-600 mt-1">选择两个版本进行对比，应用优化修改</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/edit')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回编辑
          </Button>
          {diffs.length > 0 && appliedChanges.size > 0 && (
            <Button variant="primary" onClick={handleApplySelected}>
              <Check className="w-4 h-4 mr-2" />
              应用选中的修改 ({appliedChanges.size})
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">选择基准版本（将应用改动到）</h3>
          <div className="space-y-2">
            {currentResume && (
              <div
                className={clsx(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  leftVersionId === 'current'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                )}
                onClick={() => setLeftVersionId('current')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">当前版本</div>
                    <div className="text-sm text-gray-500">正在编辑的版本</div>
                  </div>
                  {leftVersionId === 'current' && <Check className="w-5 h-5 text-blue-600" />}
                </div>
              </div>
            )}
            {versions.map((version) => (
              <div
                key={version.id}
                className={clsx(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  leftVersionId === version.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                )}
                onClick={() => setLeftVersionId(version.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{version.name}</div>
                    <div className="text-sm text-gray-500">
                      创建时间：{new Date(version.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  {leftVersionId === version.id && <Check className="w-5 h-5 text-blue-600" />}
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4">选择对比版本（改动来源）</h3>
          <div className="space-y-2">
            {currentResume && (
              <div
                className={clsx(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  rightVersionId === 'current'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                )}
                onClick={() => setRightVersionId('current')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">当前版本</div>
                    <div className="text-sm text-gray-500">正在编辑的版本</div>
                  </div>
                  {rightVersionId === 'current' && <Check className="w-5 h-5 text-green-600" />}
                </div>
              </div>
            )}
            {versions.map((version) => (
              <div
                key={version.id}
                className={clsx(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  rightVersionId === version.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                )}
                onClick={() => setRightVersionId(version.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{version.name}</div>
                    <div className="text-sm text-gray-500">
                      创建时间：{new Date(version.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  {rightVersionId === version.id && <Check className="w-5 h-5 text-green-600" />}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {leftVersion && rightVersion && (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.added}</div>
                <div className="text-sm text-gray-600 mt-1">新增内容</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.removed}</div>
                <div className="text-sm text-gray-600 mt-1">删除内容</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.modified}</div>
                <div className="text-sm text-gray-600 mt-1">修改内容</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{appliedCount}</div>
                <div className="text-sm text-gray-600 mt-1">已选修改</div>
              </div>
            </Card>
          </div>
          
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">差异对比</h3>
              <div className="text-sm text-gray-500">
                基准：{getVersionName(leftVersionId || '')} ← {getVersionName(rightVersionId || '')}
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {diffs.map((diff, index) => (
                <div
                  key={index}
                  className={clsx(
                    'p-3 rounded-lg flex items-start gap-3',
                    diff.type === 'added' && 'bg-green-50 border border-green-200',
                    diff.type === 'removed' && 'bg-red-50 border border-red-200',
                    diff.type === 'modified' && 'bg-yellow-50 border border-yellow-200'
                  )}
                >
                  <div className="flex-shrink-0">
                    {diff.type === 'added' && <span className="text-green-600 font-bold text-lg">+</span>}
                    {diff.type === 'removed' && <span className="text-red-600 font-bold text-lg">-</span>}
                    {diff.type === 'modified' && <span className="text-yellow-600 font-bold text-lg">~</span>}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{diff.content}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApplySingle(index)}
                      className={clsx(
                        'p-1.5 rounded transition-colors',
                        appliedChanges.has(index)
                          ? 'bg-green-600 text-white'
                          : 'bg-white hover:bg-green-50 text-green-600 border border-green-300'
                      )}
                      title="选中此修改"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleIgnoreSingle(index)}
                      className="p-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded transition-colors"
                      title="忽略此修改"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {diffs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>两个版本完全相同</p>
              </div>
            )}
            
            {diffs.length > 0 && (
              <div className="mt-6 flex justify-center gap-4">
                <Button variant="primary" size="lg" onClick={handleApplyAll}>
                  <Check className="w-5 h-5 mr-2" />
                  应用所有优化到当前版本
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
      
      {(!leftVersion || !rightVersion) && (
        <Card className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">请选择两个版本进行对比</h3>
          <p className="text-gray-600">从上方选择基准版本和对比版本</p>
        </Card>
      )}
    </div>
  );
}
