import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader2, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Textarea } from '@/components/common/Input';
import { useResumeStore } from '@/stores/resumeStore';
import { parsePDF } from '@/services/pdfService';
import { parseTextToResume } from '@/utils/textParser';
import { clsx } from 'clsx';
import type { Resume } from '@/types/resume';

export default function HomePage() {
  const navigate = useNavigate();
  const { importResume, currentResume } = useResumeStore();
  
  const [mode, setMode] = useState<'pdf' | 'text'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [parsedResume, setParsedResume] = useState<Resume | null>(null);
  
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
      
      const resume = parseTextToResume(content);
      setParsedResume(resume);
    } catch (err) {
      setError('PDF 解析失败，请尝试手动粘贴文本');
      setFile(null);
      setParsedResume(null);
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
      importResume(resume);
      setParsedResume(null);
      setText('');
      setError('');
      navigate('/edit');
    } catch (err) {
      setError('简历解析失败，请检查格式');
      setParsedResume(null);
    }
  };
  
  const handleParseAndGo = () => {
    if (!parsedResume) {
      setError('请先解析简历');
      return;
    }
    
    importResume(parsedResume);
    setParsedResume(null);
    navigate('/edit');
  };
  
  const handleGoToMatch = () => {
    if (!parsedResume && !currentResume) {
      setError('请先导入简历');
      return;
    }
    
    if (parsedResume) {
      importResume(parsedResume);
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
              onChange={(e) => {
                setText(e.target.value);
                setParsedResume(null);
              }}
              rows={12}
            />
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => {
                setText('');
                setParsedResume(null);
                setError('');
              }}>
                清空
              </Button>
              <Button variant="primary" onClick={handleTextImport}>
                解析简历
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      {parsedResume && (
        <Card title="简历解析结果" className="mb-6">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {parsedResume.sections.education.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">教育背景</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {parsedResume.sections.experience.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">工作经历</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {parsedResume.sections.projects.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">项目经历</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {parsedResume.sections.skills.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">技能</div>
            </div>
          </div>
          
          {parsedResume.sections.basic.name && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">{parsedResume.sections.basic.name}</div>
              {parsedResume.sections.basic.email && (
                <div className="text-sm text-gray-600">{parsedResume.sections.basic.email}</div>
              )}
              {parsedResume.sections.basic.phone && (
                <div className="text-sm text-gray-600">{parsedResume.sections.basic.phone}</div>
              )}
            </div>
          )}
          
          {parsedResume.sections.education.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">教育背景</div>
              {parsedResume.sections.education.map((edu, idx) => (
                <div key={idx} className="text-sm text-gray-600 pl-3 border-l-2 border-blue-300 mb-1">
                  {edu.school} - {edu.degree} {edu.major}
                  {(edu.startDate || edu.endDate) && (
                    <span className="text-xs text-gray-400 ml-2">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {parsedResume.sections.experience.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">工作经历</div>
              {parsedResume.sections.experience.map((exp, idx) => (
                <div key={idx} className="text-sm text-gray-600 pl-3 border-l-2 border-green-300 mb-1">
                  {exp.company} - {exp.position}
                  {(exp.startDate || exp.endDate) && (
                    <span className="text-xs text-gray-400 ml-2">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {parsedResume.sections.projects.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">项目经历</div>
              {parsedResume.sections.projects.map((proj, idx) => (
                <div key={idx} className="text-sm text-gray-600 pl-3 border-l-2 border-purple-300 mb-1">
                  {proj.name}
                  {proj.role && <span className="ml-2">({proj.role})</span>}
                </div>
              ))}
            </div>
          )}
          
          {parsedResume.sections.skills.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">技能</div>
              <div className="flex flex-wrap gap-2">
                {parsedResume.sections.skills.slice(0, 10).map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
                    {skill.name}
                  </span>
                ))}
                {parsedResume.sections.skills.length > 10 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{parsedResume.sections.skills.length - 10}
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="primary" size="lg" onClick={handleParseAndGo}>
              <Check className="w-5 h-5 mr-2" />
              确认并开始编辑
            </Button>
            <Button variant="secondary" size="lg" onClick={handleGoToMatch}>
              <ArrowRight className="w-5 h-5 mr-2" />
              前往职位匹配
            </Button>
          </div>
        </Card>
      )}
      
      {text && !parsedResume && (
        <Card className="text-center py-8">
          <p className="text-gray-600 mb-4">点击"解析简历"查看解析结果</p>
        </Card>
      )}
    </div>
  );
}
