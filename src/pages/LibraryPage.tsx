import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input, Textarea } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Tag } from '@/components/common/Tag';
import { useMaterialStore } from '@/stores/materialStore';
import type { ProjectMaterial } from '@/types/material';

export default function LibraryPage() {
  const { materials, addMaterial, updateMaterial, deleteMaterial, searchMaterials } = useMaterialStore();
  
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ProjectMaterial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    metrics: '',
    tags: '',
  });
  
  const filteredMaterials = searchQuery ? searchMaterials(searchQuery) : materials;
  
  const handleOpenModal = (material?: ProjectMaterial) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        title: material.title,
        description: material.description,
        techStack: material.techStack.join(', '),
        metrics: material.metrics.join(', '),
        tags: material.tags.join(', '),
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        title: '',
        description: '',
        techStack: '',
        metrics: '',
        tags: '',
      });
    }
    setShowModal(true);
  };
  
  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert('请填写项目名称');
      return;
    }
    
    const materialData = {
      title: formData.title,
      description: formData.description,
      techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
      metrics: formData.metrics.split(',').map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
    };
    
    if (editingMaterial) {
      updateMaterial(editingMaterial.id, materialData);
    } else {
      addMaterial(materialData);
    }
    
    setShowModal(false);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个素材吗？')) {
      deleteMaterial(id);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">项目经历素材库</h1>
          <p className="text-gray-600 mt-1">管理和复用你的项目经历素材</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          添加素材
        </Button>
      </div>
      
      <Card className="mb-6">
        <Input
          placeholder="搜索素材名称、描述、技术栈或标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="lg"
        />
      </Card>
      
      {filteredMaterials.length === 0 ? (
        <Card className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? '没有找到匹配的素材' : '暂无素材'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? '尝试其他搜索词' : '开始添加你的项目经历素材吧'}
          </p>
          {!searchQuery && (
            <Button onClick={() => handleOpenModal()}>添加第一个素材</Button>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} hoverable>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {material.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {material.description}
              </p>
              
              {material.techStack.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1.5">技术栈</div>
                  <div className="flex flex-wrap gap-1">
                    {material.techStack.slice(0, 4).map((tech) => (
                      <Tag key={tech} label={tech} color="blue" size="sm" />
                    ))}
                    {material.techStack.length > 4 && (
                      <span className="text-xs text-gray-500">+{material.techStack.length - 4}</span>
                    )}
                  </div>
                </div>
              )}
              
              {material.metrics.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1.5">成果指标</div>
                  <div className="space-y-1">
                    {material.metrics.slice(0, 2).map((metric, idx) => (
                      <div key={idx} className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        {metric}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {material.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {material.tags.slice(0, 3).map((tag) => (
                    <Tag key={tag} label={tag} color="gray" size="sm" />
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleOpenModal(material)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  删除
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMaterial ? '编辑素材' : '添加素材'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingMaterial ? '保存' : '添加'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="项目名称"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="例如：电商平台后台管理系统"
          />
          
          <Textarea
            label="项目描述"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="简要描述项目的功能、规模和你的角色..."
            rows={4}
          />
          
          <Input
            label="技术栈"
            value={formData.techStack}
            onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
            placeholder="React, Node.js, MongoDB（用逗号分隔）"
            helperText="使用的技术栈，多个用逗号分隔"
          />
          
          <Input
            label="成果指标"
            value={formData.metrics}
            onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
            placeholder="提升了30%性能，用户增长1000人（用逗号分隔）"
            helperText="量化的成果指标，多个用逗号分隔"
          />
          
          <Input
            label="标签"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Web, 全栈, 个人项目（用逗号分隔）"
            helperText="便于分类和搜索的标签"
          />
        </div>
      </Modal>
    </div>
  );
}
