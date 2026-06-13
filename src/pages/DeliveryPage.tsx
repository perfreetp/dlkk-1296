import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input, Textarea } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { StatusTag } from '@/components/common/Tag';
import { useDeliveryStore } from '@/stores/deliveryStore';
import type { DeliveryRecord, DeliveryStatus } from '@/types/delivery';
import { clsx } from 'clsx';

export default function DeliveryPage() {
  const { records, addRecord, updateRecord, deleteRecord, getStats } = useDeliveryStore();
  
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeliveryRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    status: 'pending' as DeliveryStatus,
    resumeVersionId: '',
    notes: '',
  });
  
  const stats = getStats();
  
  const filteredRecords = records.filter(record =>
    record.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleOpenModal = (record?: DeliveryRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        companyName: record.companyName,
        position: record.position,
        deliveryDate: new Date(record.deliveryDate).toISOString().split('T')[0],
        status: record.status,
        resumeVersionId: record.resumeVersionId,
        notes: record.notes,
      });
    } else {
      setEditingRecord(null);
      setFormData({
        companyName: '',
        position: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        resumeVersionId: '',
        notes: '',
      });
    }
    setShowModal(true);
  };
  
  const handleSubmit = () => {
    if (!formData.companyName.trim() || !formData.position.trim()) {
      alert('请填写公司名称和职位');
      return;
    }
    
    const recordData = {
      ...formData,
      deliveryDate: new Date(formData.deliveryDate),
    };
    
    if (editingRecord) {
      updateRecord(editingRecord.id, recordData);
    } else {
      addRecord(recordData);
    }
    
    setShowModal(false);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条投递记录吗？')) {
      deleteRecord(id);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">投递记录</h1>
          <p className="text-gray-600 mt-1">记录和管理你的投递进度</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          添加投递
        </Button>
      </div>
      
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">总投递数</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600 mt-1">待处理</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.interview}</div>
            <div className="text-sm text-gray-600 mt-1">面试中</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.conversionRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mt-1">面试转化率</div>
          </div>
        </Card>
      </div>
      
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="搜索公司或职位..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
            />
          </div>
        </div>
      </Card>
      
      {filteredRecords.length === 0 ? (
        <Card className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? '没有找到匹配的记录' : '暂无投递记录'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? '尝试其他搜索词' : '开始记录你的投递情况吧'}
          </p>
          {!searchQuery && (
            <Button onClick={() => handleOpenModal()}>添加第一条记录</Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {record.companyName}
                    </h3>
                    <StatusTag status={record.status} />
                  </div>
                  <p className="text-gray-600 mb-2">{record.position}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>投递时间：{new Date(record.deliveryDate).toLocaleDateString('zh-CN')}</span>
                    {record.notes && <span>备注：{record.notes}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(record)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRecord ? '编辑投递记录' : '添加投递记录'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingRecord ? '保存' : '添加'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="公司名称"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="例如：字节跳动"
          />
          
          <Input
            label="职位"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="例如：前端开发工程师"
          />
          
          <Input
            label="投递日期"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <div className="grid grid-cols-3 gap-2">
              {(['pending', 'interview', 'offer', 'rejected', 'no-response'] as DeliveryStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFormData({ ...formData, status })}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    formData.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {status === 'pending' && '待处理'}
                  {status === 'interview' && '面试中'}
                  {status === 'offer' && 'Offer'}
                  {status === 'rejected' && '已拒绝'}
                  {status === 'no-response' && '无反馈'}
                </button>
              ))}
            </div>
          </div>
          
          <Textarea
            label="备注"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="记录面试反馈、注意事项等..."
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
