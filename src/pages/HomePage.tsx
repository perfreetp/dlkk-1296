import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Textarea } from '@/components/common/Input';
import { useResumeStore } from '@/stores/resumeStore';
import { parsePDF } from '@/services/pdfService';
import { parseTextToResume } from '@/utils/textParser';
import { clsx } from 'clsx';

export default function HomePage() {
  const navigate = useNavigate();
  const { importResume, currentResume } = useResumeStore();
  
  const [mode, setMode] = useState<'pdf' | 'text'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.type.includes('pdf')) {
      setError('请上传 PDF 格式的文件');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError('');
    setParsing(true);
    
    try {
      const content = await parsePDF(selectedFile);
      setText(content);
    } catch (err) {
      setError('PDF 解析失败，请尝试手动粘贴文本');
      setFile(null);
    } finally {
      setParsing(false);
    }
  };
  
  const handleTextImport = () => {
    if (!text.trim()) {
      setError('请输入简历内容');
      return;
    }
    
    try {
      const resume = parseTextToResume(text);
      importResume(text);
      setError('');
    } catch (err) {
      setError('简历解析失败，请检查格式');
    }
  };
  
  const handleStart = () => {
    if (!text.trim()) {
      setError('请先导入简历');
      return;
    }
    navigate('/match');
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          快速优化你的简历
        </h1>
        <p className="text-lg text-gray-600">
          上传或粘贴简历，AI 帮你分析并优化，提升求职竞争力
        </p>
      </div>
      
      <div className="mb-8">
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setMode('pdf')}
            className={clsx(
              'px-6 py-3 rounded-lg font-medium transition-all',
              mode === 'pdf'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            <Upload className="w-5 h-5 inline-block mr-2" />
            上传 PDF
          </button>
          <button
            onClick={() => setMode('text')}
            className={clsx(
              'px-6 py-3 rounded-lg font-medium transition-all',
              mode === 'text'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            <FileText className="w-5 h-5 inline-block mr-2" />
            粘贴文本
          </button>
        </div>
        
        {mode === 'pdf' ? (
          <Card>
            <div className="text-center py-12">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-400 transition-colors">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {file ? file.name : '拖拽或点击上传 PDF 文件'}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  支持 PDF 格式，文件大小不超过 10MB
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={parsing}
                />
                <label htmlFor="file-upload">
                  <Button variant="primary" className="cursor-pointer" disabled={parsing}>
                    {parsing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        解析中...
                      </>
                    ) : (
                      '选择文件'
                    )}
                  </Button>
                </label>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <Textarea
              label="粘贴简历内容"
              placeholder="请粘贴简历的完整内容，包括个人基本信息、教育背景、工作经历、项目经历、技能等..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
            />
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setText('')}>
                清空
              </Button>
              <Button variant="primary" onClick={handleTextImport}>
                解析简历
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      {text && (
        <Card title="简历预览" className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {text}
            </pre>
          </div>
          
          {currentResume && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ✓ 简历解析成功！包含 {currentResume.sections.experience.length} 条工作经历，{currentResume.sections.projects.length} 个项目，{currentResume.sections.skills.length} 项技能
            </div>
          )}
        </Card>
      )}
      
      <div className="flex justify-center gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleStart}
          disabled={!text}
        >
          开始分析
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
