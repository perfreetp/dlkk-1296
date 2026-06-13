import React, { useState } from 'react';
import { Download, Upload, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useResumeStore } from '@/stores/resumeStore';
import { useDeliveryStore } from '@/stores/deliveryStore';
import { useMaterialStore } from '@/stores/materialStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { exportAllData, importData, downloadBlob } from '@/services/exportService';
import type { Resume, ResumeVersion } from '@/types/resume';

export default function SettingsPage() {
  const resumeStore = useResumeStore();
  const deliveryStore = useDeliveryStore();
  const materialStore = useMaterialStore();
  const settingsStore = useSettingsStore();
  
  const [importing, setImporting] = useState(false);
  
  const handleExport = async () => {
    try {
      const currentResume = resumeStore.currentResume;
      const versions = resumeStore.versions;
      const records = deliveryStore.records;
      const materials = materialStore.materials;
      
      const dataToExport = currentResume 
        ? [currentResume, ...versions.map(v => v.resume)] 
        : versions.map(v => v.resume);
      
      const blob = await exportAllData(dataToExport, records, materials);
      const filename = `resume-optimizer-backup-${new Date().toISOString().split('T')[0]}.json`;
      downloadBlob(blob, filename);
      alert('数据导出成功！');
    } catch (error) {
      alert('导出失败，请重试');
    }
  };
  
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    
    try {
      const data = await importData(file);
      
      if (!data.resumes || data.resumes.length === 0) {
        alert('导入文件为空或格式不正确');
        setImporting(false);
        return;
      }
      
      const resumeCount = data.resumes.length;
      const deliveryCount = data.deliveries?.length || 0;
      const materialCount = data.materials?.length || 0;
      
      const confirmMsg = `即将导入：\n${resumeCount} 份简历\n${deliveryCount} 条投递记录\n${materialCount} 个素材\n\n是否继续？`;
      
      if (!confirm(confirmMsg)) {
        setImporting(false);
        return;
      }
      
      const restoredVersions: ResumeVersion[] = data.resumes.map((resume, index) => ({
        id: resume.id || crypto.randomUUID(),
        resumeId: resume.id || crypto.randomUUID(),
        name: resume.name || `版本 ${index + 1}`,
        createdAt: resume.createdAt ? new Date(resume.createdAt) : new Date(),
        resume: {
          ...resume,
          id: resume.id || crypto.randomUUID(),
          createdAt: resume.createdAt ? new Date(resume.createdAt) : new Date(),
          updatedAt: resume.updatedAt ? new Date(resume.updatedAt) : new Date(),
        },
      }));
      
      const defaultResumeId = restoredVersions.find(v => v.resume.isDefault)?.id || restoredVersions[0]?.id;
      
      useResumeStore.setState({
        currentResume: restoredVersions[0]?.resume || null,
        versions: restoredVersions,
        isAnalyzing: false,
      });
      
      if (data.deliveries && data.deliveries.length > 0) {
        useDeliveryStore.setState({
          records: data.deliveries.map(record => ({
            ...record,
            id: record.id || crypto.randomUUID(),
            deliveryDate: record.deliveryDate ? new Date(record.deliveryDate) : new Date(),
            updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
          })),
        });
      } else {
        useDeliveryStore.setState({ records: [] });
      }
      
      if (data.materials && data.materials.length > 0) {
        useMaterialStore.setState({
          materials: data.materials.map(material => ({
            ...material,
            id: material.id || crypto.randomUUID(),
            createdAt: material.createdAt ? new Date(material.createdAt) : new Date(),
          })),
        });
      } else {
        useMaterialStore.setState({ materials: [] });
      }
      
      useSettingsStore.getState().setDefaultResume(defaultResumeId || null);
      
      alert(`数据导入成功！\n已恢复 ${resumeCount} 份简历、${deliveryCount} 条投递记录、${materialCount} 个素材。\n\n页面将刷新以显示新数据。`);
      
      window.location.reload();
      
    } catch (error) {
      alert('导入失败，请检查文件格式是否正确');
    } finally {
      setImporting(false);
    }
  };
  
  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      if (confirm('再次确认：所有简历、投递记录和素材都将被删除！')) {
        localStorage.clear();
        
        useResumeStore.setState({
          currentResume: null,
          versions: [],
          isAnalyzing: false,
        });
        
        useDeliveryStore.setState({
          records: [],
        });
        
        useMaterialStore.setState({
          materials: [],
        });
        
        alert('所有数据已清除！页面将重新加载。');
        
        window.location.reload();
      }
    }
  };
  
  const handleSetAsCurrent = (resume: Resume, versionId: string) => {
    useResumeStore.setState({
      currentResume: resume,
    });
    alert('已将此版本设为当前版本');
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">设置</h1>
        <p className="text-gray-600 mt-1">管理你的偏好设置和数据</p>
      </div>
      
      <div className="space-y-6">
        <Card title="简历版本">
          <p className="text-sm text-gray-600 mb-4">
            管理和查看所有保存的简历版本
          </p>
          {resumeStore.versions.length > 0 ? (
            <div className="space-y-2">
              {resumeStore.versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    resumeStore.currentResume?.id === version.resume.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleSetAsCurrent(version.resume, version.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{version.name}</div>
                      <div className="text-sm text-gray-500">
                        创建时间：{new Date(version.createdAt).toLocaleString('zh-CN')}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        教育 {version.resume.sections.education.length} 条 |
                        工作 {version.resume.sections.experience.length} 条 |
                        项目 {version.resume.sections.projects.length} 条 |
                        技能 {version.resume.sections.skills.length} 条
                      </div>
                    </div>
                    {resumeStore.currentResume?.id === version.resume.id && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">暂无保存的简历版本</p>
          )}
        </Card>
        
        <Card title="数据管理">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">数据统计</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {resumeStore.versions.length}
                  </div>
                  <div className="text-sm text-gray-600">简历版本</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {deliveryStore.records.length}
                  </div>
                  <div className="text-sm text-gray-600">投递记录</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {materialStore.materials.length}
                  </div>
                  <div className="text-sm text-gray-600">素材数量</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">导入导出</h3>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  导出数据
                </Button>
                <label className="cursor-pointer inline-flex">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    disabled={importing}
                  />
                  <Button variant="secondary" disabled={importing}>
                    <Upload className="w-4 h-4 mr-2" />
                    {importing ? '导入中...' : '导入数据'}
                  </Button>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                导出的数据为 JSON 格式，包含所有简历、投递记录和素材。导入将覆盖现有数据并刷新页面。
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-red-900 mb-2">危险操作</h3>
              <Button variant="danger" onClick={handleClearData}>
                <Trash2 className="w-4 h-4 mr-2" />
                清除所有数据
              </Button>
              <p className="text-xs text-red-600 mt-2">
                此操作将删除所有简历版本、投递记录和素材，且不可恢复
              </p>
            </div>
          </div>
        </Card>
        
        <Card title="关于">
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>简历优化助手</strong></p>
            <p>版本：1.0.0</p>
            <p>帮助应届生快速优化简历，提升求职竞争力</p>
            <p className="pt-2 text-xs text-gray-500">
              所有数据仅存储在本地浏览器中，不会上传到任何服务器
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
