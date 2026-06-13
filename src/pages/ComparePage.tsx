import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useResumeStore } from '@/stores/resumeStore';
import type { Resume } from '@/types/resume';
import { clsx } from 'clsx';

interface DiffItem {
  id: string;
  section: string;
  field: string;
  index: number;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  leftValue: string;
  rightValue: string;
  displayText: string;
}

export default function ComparePage() {
  const navigate = useNavigate();
  const { currentResume, versions, setCurrentResume } = useResumeStore();
  
  const [leftVersionId, setLeftVersionId] = useState<string | null>(null);
  const [rightVersionId, setRightVersionId] = useState<string | null>(null);
  const [selectedDiffs, setSelectedDiffs] = useState<Set<string>>(new Set());
  
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
  
  const generateDiffs = (): DiffItem[] => {
    if (!leftVersion || !rightVersion) return [];
    
    const diffs: DiffItem[] = [];
    let idCounter = 0;
    
    if (leftVersion.sections.basic.name !== rightVersion.sections.basic.name) {
      diffs.push({
        id: `basic-name-${idCounter++}`,
        section: 'basic',
        field: 'name',
        index: -1,
        type: 'modified',
        leftValue: leftVersion.sections.basic.name,
        rightValue: rightVersion.sections.basic.name,
        displayText: `姓名: "${rightVersion.sections.basic.name}" (原: "${leftVersion.sections.basic.name}")`,
      });
    }
    
    if (leftVersion.sections.basic.email !== rightVersion.sections.basic.email) {
      diffs.push({
        id: `basic-email-${idCounter++}`,
        section: 'basic',
        field: 'email',
        index: -1,
        type: 'modified',
        leftValue: leftVersion.sections.basic.email,
        rightValue: rightVersion.sections.basic.email,
        displayText: `邮箱: "${rightVersion.sections.basic.email}" (原: "${leftVersion.sections.basic.email}")`,
      });
    }
    
    if (leftVersion.sections.basic.summary !== rightVersion.sections.basic.summary) {
      diffs.push({
        id: `basic-summary-${idCounter++}`,
        section: 'basic',
        field: 'summary',
        index: -1,
        type: 'modified',
        leftValue: leftVersion.sections.basic.summary,
        rightValue: rightVersion.sections.basic.summary,
        displayText: `个人简介: "${rightVersion.sections.basic.summary}"`,
      });
    }
    
    const maxEdu = Math.max(
      leftVersion.sections.education.length,
      rightVersion.sections.education.length
    );
    
    for (let i = 0; i < maxEdu; i++) {
      const leftEdu = leftVersion.sections.education[i];
      const rightEdu = rightVersion.sections.education[i];
      
      if (!leftEdu && rightEdu) {
        diffs.push({
          id: `edu-add-${idCounter++}`,
          section: 'education',
          field: 'add',
          index: i,
          type: 'added',
          leftValue: '',
          rightValue: JSON.stringify(rightEdu),
          displayText: `教育背景 [${i + 1}]: ${rightEdu.school} - ${rightEdu.degree}`,
        });
      } else if (leftEdu && !rightEdu) {
        diffs.push({
          id: `edu-remove-${idCounter++}`,
          section: 'education',
          field: 'remove',
          index: i,
          type: 'removed',
          leftValue: JSON.stringify(leftEdu),
          rightValue: '',
          displayText: `教育背景 [${i + 1}]: ${leftEdu.school} - ${leftEdu.degree}`,
        });
      } else if (leftEdu && rightEdu) {
        if (leftEdu.school !== rightEdu.school) {
          diffs.push({
            id: `edu-school-${idCounter++}`,
            section: 'education',
            field: 'school',
            index: i,
            type: 'modified',
            leftValue: leftEdu.school,
            rightValue: rightEdu.school,
            displayText: `教育背景 [${i + 1}] 学校: "${rightEdu.school}" (原: "${leftEdu.school}")`,
          });
        }
        if (leftEdu.degree !== rightEdu.degree) {
          diffs.push({
            id: `edu-degree-${idCounter++}`,
            section: 'education',
            field: 'degree',
            index: i,
            type: 'modified',
            leftValue: leftEdu.degree,
            rightValue: rightEdu.degree,
            displayText: `教育背景 [${i + 1}] 学位: "${rightEdu.degree}" (原: "${leftEdu.degree}")`,
          });
        }
      }
    }
    
    const maxExp = Math.max(
      leftVersion.sections.experience.length,
      rightVersion.sections.experience.length
    );
    
    for (let i = 0; i < maxExp; i++) {
      const leftExp = leftVersion.sections.experience[i];
      const rightExp = rightVersion.sections.experience[i];
      
      if (!leftExp && rightExp) {
        diffs.push({
          id: `exp-add-${idCounter++}`,
          section: 'experience',
          field: 'add',
          index: i,
          type: 'added',
          leftValue: '',
          rightValue: JSON.stringify(rightExp),
          displayText: `工作经历 [${i + 1}]: ${rightExp.company} - ${rightExp.position}`,
        });
      } else if (leftExp && !rightExp) {
        diffs.push({
          id: `exp-remove-${idCounter++}`,
          section: 'experience',
          field: 'remove',
          index: i,
          type: 'removed',
          leftValue: JSON.stringify(leftExp),
          rightValue: '',
          displayText: `工作经历 [${i + 1}]: ${leftExp.company} - ${leftExp.position}`,
        });
      } else if (leftExp && rightExp) {
        if (leftExp.company !== rightExp.company) {
          diffs.push({
            id: `exp-company-${idCounter++}`,
            section: 'experience',
            field: 'company',
            index: i,
            type: 'modified',
            leftValue: leftExp.company,
            rightValue: rightExp.company,
            displayText: `工作经历 [${i + 1}] 公司: "${rightExp.company}" (原: "${leftExp.company}")`,
          });
        }
        if (leftExp.position !== rightExp.position) {
          diffs.push({
            id: `exp-position-${idCounter++}`,
            section: 'experience',
            field: 'position',
            index: i,
            type: 'modified',
            leftValue: leftExp.position,
            rightValue: rightExp.position,
            displayText: `工作经历 [${i + 1}] 职位: "${rightExp.position}" (原: "${leftExp.position}")`,
          });
        }
        if (leftExp.description !== rightExp.description) {
          diffs.push({
            id: `exp-desc-${idCounter++}`,
            section: 'experience',
            field: 'description',
            index: i,
            type: 'modified',
            leftValue: leftExp.description,
            rightValue: rightExp.description,
            displayText: `工作经历 [${i + 1}] 描述已修改`,
          });
        }
      }
    }
    
    const maxProj = Math.max(
      leftVersion.sections.projects.length,
      rightVersion.sections.projects.length
    );
    
    for (let i = 0; i < maxProj; i++) {
      const leftProj = leftVersion.sections.projects[i];
      const rightProj = rightVersion.sections.projects[i];
      
      if (!leftProj && rightProj) {
        diffs.push({
          id: `proj-add-${idCounter++}`,
          section: 'project',
          field: 'add',
          index: i,
          type: 'added',
          leftValue: '',
          rightValue: JSON.stringify(rightProj),
          displayText: `项目经历 [${i + 1}]: ${rightProj.name} - ${rightProj.role}`,
        });
      } else if (leftProj && !rightProj) {
        diffs.push({
          id: `proj-remove-${idCounter++}`,
          section: 'project',
          field: 'remove',
          index: i,
          type: 'removed',
          leftValue: JSON.stringify(leftProj),
          rightValue: '',
          displayText: `项目经历 [${i + 1}]: ${leftProj.name} - ${leftProj.role}`,
        });
      } else if (leftProj && rightProj) {
        if (leftProj.name !== rightProj.name) {
          diffs.push({
            id: `proj-name-${idCounter++}`,
            section: 'project',
            field: 'name',
            index: i,
            type: 'modified',
            leftValue: leftProj.name,
            rightValue: rightProj.name,
            displayText: `项目经历 [${i + 1}] 名称: "${rightProj.name}" (原: "${leftProj.name}")`,
          });
        }
        if (leftProj.description !== rightProj.description) {
          diffs.push({
            id: `proj-desc-${idCounter++}`,
            section: 'project',
            field: 'description',
            index: i,
            type: 'modified',
            leftValue: leftProj.description,
            rightValue: rightProj.description,
            displayText: `项目经历 [${i + 1}] 描述已修改`,
          });
        }
      }
    }
    
    const leftSkillCount = leftVersion.sections.skills.length;
    const rightSkillCount = rightVersion.sections.skills.length;
    
    if (leftSkillCount !== rightSkillCount) {
      diffs.push({
        id: `skill-count-${idCounter++}`,
        section: 'skill',
        field: 'count',
        index: -1,
        type: 'modified',
        leftValue: leftSkillCount.toString(),
        rightValue: rightSkillCount.toString(),
        displayText: `技能数量: ${rightSkillCount} (原: ${leftSkillCount})`,
      });
    }
    
    return diffs.filter(d => d.type !== 'unchanged');
  };
  
  const diffs = leftVersion && rightVersion ? generateDiffs() : [];
  
  const stats = {
    added: diffs.filter(d => d.type === 'added').length,
    removed: diffs.filter(d => d.type === 'removed').length,
    modified: diffs.filter(d => d.type === 'modified').length,
  };
  
  const handleToggleDiff = (id: string) => {
    const newSelected = new Set(selectedDiffs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDiffs(newSelected);
  };
  
  const handleApplySelected = () => {
    if (!rightVersion || selectedDiffs.size === 0) {
      alert('请先选择要应用的修改');
      return;
    }
    
    const mergedResume = JSON.parse(JSON.stringify(leftVersion)) as Resume;
    
    selectedDiffs.forEach(id => {
      const diff = diffs.find(d => d.id === id);
      if (!diff) return;
      
      switch (diff.section) {
        case 'basic':
          if (diff.field === 'name') {
            mergedResume.sections.basic.name = diff.rightValue;
          } else if (diff.field === 'email') {
            mergedResume.sections.basic.email = diff.rightValue;
          } else if (diff.field === 'summary') {
            mergedResume.sections.basic.summary = diff.rightValue;
          }
          break;
          
        case 'education':
          if (diff.field === 'add') {
            mergedResume.sections.education.push(JSON.parse(diff.rightValue));
          } else if (diff.field === 'remove') {
            mergedResume.sections.education.splice(diff.index, 1);
          } else if (diff.field === 'school') {
            mergedResume.sections.education[diff.index].school = diff.rightValue;
          } else if (diff.field === 'degree') {
            mergedResume.sections.education[diff.index].degree = diff.rightValue;
          }
          break;
          
        case 'experience':
          if (diff.field === 'add') {
            mergedResume.sections.experience.push(JSON.parse(diff.rightValue));
          } else if (diff.field === 'remove') {
            mergedResume.sections.experience.splice(diff.index, 1);
          } else if (diff.field === 'company') {
            mergedResume.sections.experience[diff.index].company = diff.rightValue;
          } else if (diff.field === 'position') {
            mergedResume.sections.experience[diff.index].position = diff.rightValue;
          } else if (diff.field === 'description') {
            mergedResume.sections.experience[diff.index].description = diff.rightValue;
          }
          break;
          
        case 'project':
          if (diff.field === 'add') {
            mergedResume.sections.projects.push(JSON.parse(diff.rightValue));
          } else if (diff.field === 'remove') {
            mergedResume.sections.projects.splice(diff.index, 1);
          } else if (diff.field === 'name') {
            mergedResume.sections.projects[diff.index].name = diff.rightValue;
          } else if (diff.field === 'description') {
            mergedResume.sections.projects[diff.index].description = diff.rightValue;
          }
          break;
      }
    });
    
    mergedResume.updatedAt = new Date();
    
    setCurrentResume(mergedResume);
    
    alert(`已成功应用 ${selectedDiffs.size} 项修改到当前版本！`);
    navigate('/edit');
  };
  
  const handleApplyAll = () => {
    if (!rightVersion) return;
    
    setCurrentResume({ ...rightVersion, updatedAt: new Date() });
    
    alert('已应用所有优化到当前版本！');
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
          {diffs.length > 0 && selectedDiffs.size > 0 && (
            <Button variant="primary" onClick={handleApplySelected}>
              <Check className="w-4 h-4 mr-2" />
              应用选中的修改 ({selectedDiffs.size})
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">基准版本（将应用改动到）</h3>
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
          <h3 className="text-lg font-semibold mb-4">对比版本（改动来源）</h3>
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
          <div className="grid md:grid-cols-3 gap-4 mb-6">
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
          </div>
          
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">差异对比</h3>
              <div className="text-sm text-gray-500">
                基准：{getVersionName(leftVersionId || '')} ← {getVersionName(rightVersionId || '')}
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {diffs.map((diff) => (
                <div
                  key={diff.id}
                  className={clsx(
                    'p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-all',
                    diff.type === 'added' && 'bg-green-50 border border-green-200',
                    diff.type === 'removed' && 'bg-red-50 border border-red-200',
                    diff.type === 'modified' && 'bg-yellow-50 border border-yellow-200',
                    selectedDiffs.has(diff.id) && 'ring-2 ring-blue-500'
                  )}
                  onClick={() => handleToggleDiff(diff.id)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {diff.type === 'added' && <span className="text-green-600 font-bold text-lg">+</span>}
                    {diff.type === 'removed' && <span className="text-red-600 font-bold text-lg">-</span>}
                    {diff.type === 'modified' && <span className="text-yellow-600 font-bold text-lg">~</span>}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{diff.displayText}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {diff.section === 'basic' && '基本信息'}
                      {diff.section === 'education' && '教育背景'}
                      {diff.section === 'experience' && '工作经历'}
                      {diff.section === 'project' && '项目经历'}
                      {diff.section === 'skill' && '技能'}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {selectedDiffs.has(diff.id) ? (
                      <Check className="w-5 h-5 text-blue-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                    )}
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
