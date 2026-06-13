import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parsePDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      text += pageText + '\n\n';
    }
    
    return text.trim();
  } catch (error) {
    console.error('PDF解析错误:', error);
    throw new Error('PDF解析失败，请尝试手动粘贴文本');
  }
}

export async function getPDFInfo(file: File): Promise<{
  numPages: number;
  title?: string;
  author?: string;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const metadata = await pdf.getMetadata();
    const info = metadata.info as any;
    
    return {
      numPages: pdf.numPages,
      title: info?.Title,
      author: info?.Author,
    };
  } catch (error) {
    console.error('获取PDF信息错误:', error);
    throw new Error('无法读取PDF文件信息');
  }
}

export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['application/pdf'];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '请上传PDF格式的文件' };
  }
  
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过10MB' };
  }
  
  return { valid: true };
}
