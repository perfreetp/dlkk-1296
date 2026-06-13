import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Download } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useResumeStore } from '@/stores/resumeStore';
import { compareVersions, calculateDiffStats } from '@/utils/diffEngine';
import { clsx } from 'clsx';

export default function ComparePage() {
  const navigate = useNavigate();
  const { currentResume, versions } = useResumeStore();
  
  const [selectedVersions, setSelectedVersions] = useState<[string | null, string | null]>([null, null]);
  const [showDiff, setShowDiff] = useState(false);
  
  const diffs = currentResume && versions.length > 0
    ? compareVersions(
        currentResume,
        versions[versions.length - 1]?.resume || currentResume
      )
    : [];
  
  const stats = calculateDiffStats(diffs);
  
  const handleApplyAll = () => {
    alert('已应用所有优化！');
    navigate('/edit');
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">版本对比</h1>
          <p className="text-gray-600 mt-1">对比不同版本之间的差异，选择性应用优化</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/edit')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回编辑
          </Button>
          {showDiff && (
            <Button variant="primary" onClick={handleApplyAll}>
              <Check className="w-4 h-4 mr-2" />
              应用所有优化
            </Button>
          )}
        </div>
      </div>
      
      {versions.length === 0 ? (
        <Card className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无保存的版本</h3>
          <p className="text-gray-600 mb-6">请先在优化编辑页保存简历版本</p>
          <Button onClick={() => navigate('/edit')}>去保存版本</Button>
        </Card>
      ) : (
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
          
          {!showDiff ? (
            <Card>
              <h3 className="text-lg font-semibold mb-4">选择要对比的版本</h3>
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-all"
                    onClick={() => setShowDiff(true)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{version.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          创建时间：{new Date(version.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">版本 {index + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">差异对比</h3>
                <Button variant="secondary" onClick={() => setShowDiff(false)}>
                  重新选择
                </Button>
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
                        <button className="p-1 hover:bg-white rounded transition-colors">
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button className="p-1 hover:bg-white rounded transition-colors">
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
