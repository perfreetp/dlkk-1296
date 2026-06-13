import type { Resume } from '@/types/resume';
import type { DeliveryRecord } from '@/types/delivery';
import type { ProjectMaterial } from '@/types/material';

export interface ExportData {
  resumes: Resume[];
  deliveries: DeliveryRecord[];
  materials: ProjectMaterial[];
  exportedAt: string;
  version: string;
}

export async function exportAllData(
  resumes: Resume[],
  deliveries: DeliveryRecord[],
  materials: ProjectMaterial[]
): Promise<Blob> {
  const data: ExportData = {
    resumes,
    deliveries,
    materials,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
  
  return new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
}

export async function importData(file: File): Promise<ExportData> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as ExportData;
    
    if (!data.version || !data.exportedAt) {
      throw new Error('无效的导入文件格式');
    }
    
    return data;
  } catch (error) {
    throw new Error('导入文件解析失败，请检查文件格式');
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportToPDF(htmlContent: string, filename: string): Promise<void> {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('无法打开打印窗口，请检查浏览器设置');
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body {
            font-family: "Noto Sans SC", "SimSun", serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          h1 { font-size: 24px; margin-bottom: 8px; }
          h2 { font-size: 18px; margin-top: 24px; border-bottom: 2px solid #2563EB; padding-bottom: 4px; }
          h3 { font-size: 16px; margin-top: 16px; }
          p { margin: 8px 0; }
          ul { margin: 8px 0; padding-left: 24px; }
          li { margin: 4px 0; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
