import type { Resume, Education, Experience, Project, Skill } from '@/types/resume';

const SECTION_PATTERNS = {
  education: /^(教育|教育背景|学历)$/i,
  experience: /^(工作|工作经历|实习|实习经历|社会实践)$/i,
  project: /^(项目|项目经历|项目经验)$/i,
  skill: /^(技能|技能特长|专业技能|技术栈)$/i,
  summary: /^(个人简介|简介|求职意向|个人概述)$/i,
};

const DEGREE_PATTERNS = /博|硕|本科|大专|高中|中专|硕士|博士/;
const SCHOOL_PATTERNS = /大学|学院|学校|Institute|University|College/;

function isDateLine(text: string): boolean {
  return /\d{4}[-/年]\d{1,2}[-/月]?\s*[-~至]\s*\d{4}[-/年]\d{1,2}[-/月]?|\d{4}[-/年]\d{1,2}[-/月]?\s*(至今|现在|present|current)/i.test(text) ||
         /\d{4}\s*[-~至]\s*\d{4}|\d{4}\s*(至今|现在|present|current)/i.test(text);
}

function parseDateRange(text: string): { startDate: string; endDate: string } {
  const result = { startDate: '', endDate: '' };
  
  const rangeMatch = text.match(/(\d{4}[-/年]?\d{0,2}[-/月]?)\s*[-~至]\s*(\d{4}[-/年]?\d{0,2}[-/月]?|至今|现在|present|current)/i);
  
  if (rangeMatch) {
    result.startDate = rangeMatch[1].replace(/年/g, '-').replace(/月/g, '').replace(/\//g, '-');
    result.endDate = /至今|现在|present|current/i.test(rangeMatch[2]) ? '至今' : rangeMatch[2].replace(/年/g, '-').replace(/月/g, '').replace(/\//g, '-');
  } else {
    const yearMatch = text.match(/\d{4}/g);
    if (yearMatch && yearMatch.length >= 1) {
      result.startDate = yearMatch[0];
      if (yearMatch.length >= 2) {
        result.endDate = yearMatch[1];
      }
    }
  }
  
  return result;
}

function isExperienceHeader(line: string): boolean {
  const patterns = [
    /公司|企业|Co\.|Ltd\.|Inc\./,
    /\d{4}[-/年.]\d{1,2}/,
    /开始|结束/,
  ];
  return patterns.some(p => p.test(line));
}

function isProjectHeader(line: string): boolean {
  const patterns = [
    /项目/,
    /\d{4}[-/年.]\d{1,2}/,
    /系统|平台|应用|工具/,
  ];
  return patterns.some(p => p.test(line));
}

function isDateOnlyLine(text: string): boolean {
  const datePattern = /^\d{4}[-/年.]\d{1,2}(月)?\s*[-~至]\s*\d{4}[-/年.]\d{1,2}(月)?(\s*\(至今|现在\))?$/;
  const dateOnlyPattern = /^\d{4}[-/年.]\d{1,2}(月)?(\s*[-~至]\s*(\d{4}[-/年.]\d{1,2}(月)?|至今|现在|present|current))?$/;
  return datePattern.test(text.trim()) || (dateOnlyPattern.test(text.trim()) && text.includes('20'));
}

function parseExperienceBlocks(text: string): Experience[] {
  const experiences: Experience[] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  let currentExp: Experience | null = null;
  let descriptionBuffer: string[] = [];
  
  const flushCurrentExp = () => {
    if (currentExp) {
      if (descriptionBuffer.length > 0) {
        currentExp.description = descriptionBuffer.join(' ').replace(/\s+/g, ' ');
        currentExp.highlights = descriptionBuffer
          .filter(line => line.startsWith('•') || line.startsWith('-') || line.startsWith('·'))
          .map(line => line.replace(/^[•\-\·]\s*/, ''));
      }
      experiences.push(currentExp);
    }
    currentExp = null;
    descriptionBuffer = [];
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (isDateOnlyLine(line) || /^(至今|现在|present|current)$/i.test(line)) {
      if (currentExp && !currentExp.startDate) {
        const dates = parseDateRange(line);
        currentExp.startDate = dates.startDate;
        currentExp.endDate = dates.endDate;
      } else if (currentExp && currentExp.startDate && !currentExp.endDate) {
        const dates = parseDateRange(line);
        currentExp.endDate = dates.endDate;
      } else if (currentExp && currentExp.startDate && currentExp.endDate) {
        flushCurrentExp();
      }
      continue;
    }
    
    const hasDate = isDateLine(line);
    const isCompanyName = /公司|企业|Co\.|Ltd\.|Inc\.|集团|工作室/i.test(line) && line.length < 60;
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('·');
    const hasMetrics = /\d+%|\d+倍|\d+个|\d+人|\d+万|\d+天/.test(line);
    
    if (isCompanyName || (hasDate && currentExp && currentExp.company)) {
      flushCurrentExp();
      
      currentExp = {
        company: isCompanyName ? line : '',
        position: '',
        startDate: hasDate && !isCompanyName ? parseDateRange(line).startDate : '',
        endDate: hasDate && !isCompanyName ? parseDateRange(line).endDate : '',
        description: '',
        highlights: [],
      };
      
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (!isDateOnlyLine(nextLine) && !nextLine.startsWith('•') && !nextLine.startsWith('-') && nextLine.length < 40) {
          currentExp.position = nextLine;
          i++;
        }
      }
    } else if (!currentExp && (hasDate || line.length < 50)) {
      flushCurrentExp();
      
      currentExp = {
        company: '',
        position: line.length < 50 ? line : '',
        startDate: hasDate ? parseDateRange(line).startDate : '',
        endDate: hasDate ? parseDateRange(line).endDate : '',
        description: '',
        highlights: [],
      };
    } else if (currentExp) {
      if (currentExp.position && !currentExp.startDate && hasDate) {
        currentExp.startDate = parseDateRange(line).startDate;
        currentExp.endDate = parseDateRange(line).endDate;
      } else if (!currentExp.position && line.length < 50 && !isBullet) {
        currentExp.position = line;
      } else if (line.length > 5 || isBullet || hasMetrics) {
        descriptionBuffer.push(line);
      }
    }
  }
  
  flushCurrentExp();
  
  if (experiences.length === 0 && text.trim()) {
    experiences.push({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: text.trim(),
      highlights: [],
    });
  }
  
  return experiences;
}

function parseProjectBlocks(text: string): Project[] {
  const projects: Project[] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  let currentProj: Project | null = null;
  let descriptionBuffer: string[] = [];
  
  const flushCurrentProj = () => {
    if (currentProj) {
      if (descriptionBuffer.length > 0) {
        currentProj.description = descriptionBuffer.join(' ').replace(/\s+/g, ' ');
        currentProj.metrics = descriptionBuffer
          .filter(line => /\d+%|\d+倍|\d+个|\d+人|\d+万|\d+天/.test(line));
      }
      projects.push(currentProj);
    }
    currentProj = null;
    descriptionBuffer = [];
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (isDateOnlyLine(line)) {
      if (currentProj && !currentProj.startDate) {
        const dates = parseDateRange(line);
        currentProj.startDate = dates.startDate;
        currentProj.endDate = dates.endDate;
      } else if (currentProj && currentProj.startDate && !currentProj.endDate) {
        const dates = parseDateRange(line);
        currentProj.endDate = dates.endDate;
      } else if (currentProj && currentProj.startDate && currentProj.endDate) {
        flushCurrentProj();
      }
      continue;
    }
    
    const hasDate = isDateLine(line);
    const isProjectName = /项目[一二三四五六七八九十\d]/.test(line) || 
                          /项目名称[：:]/i.test(line) ||
                          (/项目/.test(line) && line.length < 50);
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('·');
    const hasMetrics = /\d+%|\d+倍|\d+个|\d+人|\d+万|\d+天/.test(line);
    
    if (isProjectName || (hasDate && currentProj && currentProj.name)) {
      flushCurrentProj();
      
      currentProj = {
        name: line.replace(/项目[一二三四五六七八九十\d][：:]\s*/, '').replace(/项目名称[：:]\s*/, ''),
        role: '',
        startDate: '',
        endDate: '',
        description: '',
        technologies: [],
        metrics: [],
      };
      
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (/角色|职责|负责/.test(nextLine)) {
          currentProj.role = nextLine;
          i++;
        } else if (isDateOnlyLine(nextLine)) {
          const dates = parseDateRange(nextLine);
          currentProj.startDate = dates.startDate;
          currentProj.endDate = dates.endDate;
          i++;
        }
      }
    } else if (!currentProj && (hasDate || line.length < 60)) {
      flushCurrentProj();
      
      currentProj = {
        name: line.length < 60 ? line : '',
        role: '',
        startDate: hasDate ? parseDateRange(line).startDate : '',
        endDate: hasDate ? parseDateRange(line).endDate : '',
        description: '',
        technologies: [],
        metrics: [],
      };
    } else if (currentProj) {
      if (/技术栈|技术|框架|工具/.test(line)) {
        currentProj.technologies = line.split(/[,，、;:]/).map(s => s.trim()).filter(Boolean);
      } else if (/角色|职责|负责/.test(line) && !currentProj.role) {
        currentProj.role = line;
      } else if (currentProj.startDate && !currentProj.endDate && hasDate) {
        const dates = parseDateRange(line);
        currentProj.endDate = dates.endDate;
      } else if (!currentProj.startDate && hasDate) {
        const dates = parseDateRange(line);
        currentProj.startDate = dates.startDate;
        currentProj.endDate = dates.endDate;
      } else if (line.length > 5 || isBullet || hasMetrics) {
        descriptionBuffer.push(line);
      }
    }
  }
  
  flushCurrentProj();
  
  if (projects.length === 0 && text.trim()) {
    projects.push({
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: text.trim(),
      technologies: [],
      metrics: [],
    });
  }
  
  return projects;
}

function parseEducation(text: string): Education[] {
  const educations: Education[] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  let currentEdu: Education | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) continue;
    
    const hasDate = isDateLine(trimmed);
    const isSchool = SCHOOL_PATTERNS.test(trimmed);
    
    if (isSchool && (!currentEdu || currentEdu.school)) {
      if (currentEdu) {
        educations.push(currentEdu);
      }
      
      currentEdu = {
        school: trimmed,
        degree: '',
        major: '',
        startDate: '',
        endDate: '',
      };
    } else if (currentEdu) {
      if (DEGREE_PATTERNS.test(trimmed)) {
        if (!currentEdu.degree) {
          currentEdu.degree = trimmed;
          const majorMatch = trimmed.match(/[\u4e00-\u9fa5]+\s*专业/);
          if (majorMatch) {
            currentEdu.major = majorMatch[0];
          }
        }
      } else if (hasDate && !currentEdu.startDate) {
        const dates = parseDateRange(trimmed);
        currentEdu.startDate = dates.startDate;
        currentEdu.endDate = dates.endDate;
      } else if (trimmed.length > 2 && !currentEdu.degree) {
        currentEdu.degree = trimmed;
      }
    } else if (isSchool) {
      currentEdu = {
        school: trimmed,
        degree: '',
        major: '',
        startDate: '',
        endDate: '',
      };
    }
  }
  
  if (currentEdu && currentEdu.school) {
    educations.push(currentEdu);
  }
  
  return educations;
}

function parseSkills(text: string): Skill[] {
  const skills: Skill[] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed || trimmed.length < 2) continue;
    
    const parts = trimmed.split(/[,，、;|:：\n]/).filter(s => s.trim());
    
    for (const part of parts) {
      const skillName = part.replace(/精通|熟练|掌握|了解/g, '').trim();
      
      if (skillName.length > 0 && skillName.length < 30) {
        let level: '精通' | '熟练' | '了解' = '了解';
        if (/精通/.test(part)) level = '精通';
        else if (/熟练/.test(part)) level = '熟练';
        
        const isLanguage = /英语|日语|韩语|法语|德语|CET|TOEFL|IELTS/.test(skillName);
        
        skills.push({
          name: skillName,
          level,
          category: isLanguage ? '语言' : '技术',
        });
      }
    }
  }
  
  return skills;
}

export function parseTextToResume(text: string): Resume {
  const resume: Resume = {
    id: crypto.randomUUID(),
    name: '导入简历',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: {
      basic: {
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
      },
      education: [],
      experience: [],
      projects: [],
      skills: [],
    },
  };
  
  const lines = text.split('\n');
  let currentSection: string | null = null;
  let sectionContent: string[] = [];
  let basicContent: string[] = [];
  let summaryContent: string[] = [];
  let inSummary = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    if (i < 3) {
      const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch && !resume.sections.basic.email) {
        resume.sections.basic.email = emailMatch[0];
        continue;
      }
      
      const phoneMatch = line.match(/1[3-9]\d{9}|1[3-9]\s\d{4}\s\d{4}/);
      if (phoneMatch && !resume.sections.basic.phone) {
        resume.sections.basic.phone = phoneMatch[0].replace(/\s/g, '');
        continue;
      }
      
      if (/^[\u4e00-\u9fa5]{2,4}$/.test(line) && !resume.sections.basic.name) {
        resume.sections.basic.name = line;
        continue;
      }
    }
    
    if (SECTION_PATTERNS.summary.test(line)) {
      if (sectionContent.length > 0 && currentSection) {
        saveSection(resume, currentSection, sectionContent);
      }
      inSummary = true;
      currentSection = null;
      sectionContent = [];
      continue;
    }
    
    if (SECTION_PATTERNS.education.test(line)) {
      if (sectionContent.length > 0 && currentSection) {
        saveSection(resume, currentSection, sectionContent);
      }
      inSummary = false;
      currentSection = 'education';
      sectionContent = [];
      continue;
    }
    
    if (SECTION_PATTERNS.experience.test(line)) {
      if (sectionContent.length > 0 && currentSection) {
        saveSection(resume, currentSection, sectionContent);
      }
      inSummary = false;
      currentSection = 'experience';
      sectionContent = [];
      continue;
    }
    
    if (SECTION_PATTERNS.project.test(line)) {
      if (sectionContent.length > 0 && currentSection) {
        saveSection(resume, currentSection, sectionContent);
      }
      inSummary = false;
      currentSection = 'project';
      sectionContent = [];
      continue;
    }
    
    if (SECTION_PATTERNS.skill.test(line)) {
      if (sectionContent.length > 0 && currentSection) {
        saveSection(resume, currentSection, sectionContent);
      }
      inSummary = false;
      currentSection = 'skill';
      sectionContent = [];
      continue;
    }
    
    if (inSummary) {
      summaryContent.push(line);
    } else if (currentSection) {
      sectionContent.push(line);
    } else {
      basicContent.push(line);
    }
  }
  
  if (sectionContent.length > 0 && currentSection) {
    saveSection(resume, currentSection, sectionContent);
  }
  
  if (summaryContent.length > 0) {
    resume.sections.basic.summary = summaryContent.join(' ').replace(/\s+/g, ' ');
  }
  
  if (basicContent.length > 0 && !resume.sections.basic.summary) {
    const summary = basicContent.join(' ').replace(/\s+/g, ' ');
    if (summary.length > 10) {
      resume.sections.basic.summary = summary;
    }
  }
  
  return resume;
}

function saveSection(resume: Resume, section: string, content: string[]): void {
  const text = content.join('\n');
  
  switch (section) {
    case 'education':
      resume.sections.education = parseEducation(text);
      break;
    case 'experience':
      resume.sections.experience = parseExperienceBlocks(text);
      break;
    case 'project':
      resume.sections.projects = parseProjectBlocks(text);
      break;
    case 'skill':
      resume.sections.skills = parseSkills(text);
      break;
  }
}

export function resumeToHtml(resume: Resume): string {
  let html = '<div class="resume">';
  
  html += '<h1>' + resume.sections.basic.name + '</h1>';
  html += '<p>' + resume.sections.basic.email + ' | ' + resume.sections.basic.phone + '</p>';
  
  if (resume.sections.basic.summary) {
    html += '<h2>个人简介</h2><p>' + resume.sections.basic.summary + '</p>';
  }
  
  if (resume.sections.education.length > 0) {
    html += '<h2>教育背景</h2>';
    resume.sections.education.forEach(edu => {
      html += `<p>${edu.school} - ${edu.degree} ${edu.major} (${edu.startDate} - ${edu.endDate})</p>`;
    });
  }
  
  if (resume.sections.experience.length > 0) {
    html += '<h2>工作经历</h2>';
    resume.sections.experience.forEach(exp => {
      html += `<h3>${exp.company} - ${exp.position}</h3>`;
      html += `<p>${exp.startDate} - ${exp.endDate}</p>`;
      html += `<p>${exp.description}</p>`;
      if (exp.highlights.length > 0) {
        html += '<ul>';
        exp.highlights.forEach(h => {
          html += `<li>${h}</li>`;
        });
        html += '</ul>';
      }
    });
  }
  
  if (resume.sections.projects.length > 0) {
    html += '<h2>项目经历</h2>';
    resume.sections.projects.forEach(proj => {
      html += `<h3>${proj.name} - ${proj.role}</h3>`;
      html += `<p>${proj.startDate} - ${proj.endDate}</p>`;
      html += `<p>${proj.description}</p>`;
      if (proj.technologies.length > 0) {
        html += '<p>技术栈: ' + proj.technologies.join(', ') + '</p>';
      }
    });
  }
  
  if (resume.sections.skills.length > 0) {
    html += '<h2>技能</h2><ul>';
    resume.sections.skills.forEach(skill => {
      html += `<li>${skill.name} (${skill.level})</li>`;
    });
    html += '</ul>';
  }
  
  html += '</div>';
  
  return html;
}
