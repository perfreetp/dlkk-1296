import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Download } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useResumeStore } from '@/stores/resumeStore';
import { compareVersions, calculateDiffStats } from '@/utils/diffEngine';
import { clsx } from 'clsx';

export default function ComparePage() {
  const navigate = useNavigate();
  const { currentResume, versions, updateSection } = useResumeStore();
  
  const [leftVersionId, setLeftVersionId] = useState<string | null>(null);
  const [rightVersionId, setRightVersionId] = useState<string | null>(null);
  const [appliedChanges, setAppliedChanges] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    if (versions.length > 0 && !rightVersionId) {
      setRightVersionId(versions[versions.length - 1].id);
    }
    if (currentResume && !leftVersionId) {
      setLeftVersionId('current');
    }
  }, [versions, currentResume]);
  
  const getVersionById = (id: string) => {
    if (id === 'current') return currentResume;
    return versions.find(v => v.id === id)?.resume;
  };
  
  const getVersionName = (id: string) => {
    if (id === 'current') return '当前版本';
    return versions.find(v => v.id === id)?.name || '未知版本';
  };
  
  const leftVersion = leftVersionId ? getVersionById(leftVersionId) : null;
  const rightVersion = rightVersionId ? getVersionById(rightVersionId) : null;
  
  const diffs = leftVersion && rightVersion
    ? compareVersions(leftVersion, rightVersion)
    : [];
  
  const stats = calculateDiffStats(diffs);
  
  const handleApplyAll = () => {
    if (!currentResume) return;
    
    let updatedSections = { ...currentResume.sections };
    
    diffs.forEach((diff, index) => {
      if (diff.type === 'added' || diff.type === 'modified') {
        appliedChanges.add(index);
      }
    });
    
    setAppliedChanges(new Set(appliedChanges));
    
    const updatedResume = {
      ...currentResume,
      sections: updatedSections,
      updatedAt: new Date(),
    };
    
    Object.keys(updatedSections).forEach(key => {
      updateSection(key, updatedSections[key as keyof typeof updatedSections]);
    });
    
    alert('已应用所有优化到当前版本！');
    navigate('/edit');
  };
  
  const handleApplySingle = (index: number) => {
    const newApplied = new Set(appliedChanges);
    newApplied.add(index);
    setAppliedChanges(newApplied);
  };
  
  const handleIgnoreSingle = (index: number) => {
    const newApplied = new Set(appliedChanges);
    newApplied.delete(index);
    setAppliedChanges(newApplied);
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
          {diffs.length > 0 && (
            <Button variant="primary" onClick={handleApplyAll}>
              <Check className="w-4 h-4 mr-2" />
              应用所有优化
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">选择左侧版本（基准）</h3>
          <div className="space-y-2">
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
          <h3 className="text-lg font-semibold mb-4">选择右侧版本（对比）</h3>
          <div className="space-y-2">
            {currentResume && (
              <div
                className={clsx(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  rightVersionId === 'current'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                )}
                onClick={() => setRightVersionId('current')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">当前版本</div>
                    <div className="text-sm text-gray-500">正在编辑的版本</div>
                  </div>
                  {rightVersionId === 'current' && <Check className="w-5 h-5 text-blue-600" />}
                </div>
              </div>
            )}
            {versions.map((version) => (
              <div
                key={version.id}
                className={clsx(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  rightVersionId === version.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
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
                  {rightVersionId === version.id && <Check className="w-5 h-5 text-blue-600" />}
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
                <div className="text-3xl font-bold text-blue-600">{stats.unchanged}</div>
                <div className="text-sm text-gray-600 mt-1">保持不变</div>
              </div>
            </Card>
          </div>
          
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">差异对比</h3>
              <div className="text-sm text-gray-500">
                基准：{getVersionName(leftVersionId || '')} vs {getVersionName(rightVersionId || '')}
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
                    diff.type === 'unchanged' && 'bg-gray-50 border border-gray-200'
                  )}
                >
                  <div className="flex-shrink-0">
                    {diff.type === 'added' && <span className="text-green-600 font-bold">+</span>}
                    {diff.type === 'removed' && <span className="text-red-600 font-bold">-</span>}
                    {diff.type === 'unchanged' && <span className="text-gray-400 font-bold">=</span>}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{diff.content}</div>
                  </div>
                  {diff.type !== 'unchanged' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApplySingle(index)}
                        className={clsx(
                          'p-1.5 rounded transition-colors',
                          appliedChanges.has(index)
                            ? 'bg-green-600 text-white'
                            : 'bg-white hover:bg-green-50 text-green-600 border border-green-300'
                        )}
                        title="应用此修改"
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
                  )}
                </div>
              ))}
            </div>
            
            {diffs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>两个版本完全相同</p>
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
