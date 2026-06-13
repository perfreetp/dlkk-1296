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

function isSkillSection(line: string): boolean {
  const techSkills = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'React', 'Vue', 'Node.js', 'SQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'CSS', 'HTML', 'Spring', 'MySQL', 'Redis', 'Linux', 'Kubernetes', '微服务', '前端', '后端', '全栈'];
  return techSkills.some(skill => line.includes(skill));
}

function parseEducation(lines: string[], startIndex: number): { education: Education; endIndex: number } {
  const education: Education = {
    school: '',
    degree: '',
    major: '',
    startDate: '',
    endDate: '',
  };
  
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (SECTION_PATTERNS.experience.test(line) || SECTION_PATTERNS.project.test(line) || SECTION_PATTERNS.skill.test(line)) {
      break;
    }
    
    if (SCHOOL_PATTERNS.test(line) && !education.school) {
      education.school = line;
    } else if (DEGREE_PATTERNS.test(line) && !education.degree) {
      education.degree = line;
      const majorMatch = line.match(/[\u4e00-\u9fa5]+\s*专业/);
      if (majorMatch) {
        education.major = majorMatch[0];
      } else if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (!SECTION_PATTERNS.experience.test(nextLine) && !SECTION_PATTERNS.project.test(nextLine)) {
          education.major = nextLine;
          i++;
        }
      }
    } else if (isDateLine(line)) {
      const dates = parseDateRange(line);
      if (!education.startDate) {
        education.startDate = dates.startDate;
        education.endDate = dates.endDate;
      }
    } else if (line.length > 3 && !education.school) {
      education.school = line;
    }
    
    i++;
  }
  
  return { education, endIndex: i - 1 };
}

function parseExperience(lines: string[], startIndex: number): { experience: Experience; endIndex: number } {
  const experience: Experience = {
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    highlights: [],
  };
  
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (SECTION_PATTERNS.project.test(line) || SECTION_PATTERNS.skill.test(line)) {
      break;
    }
    
    if (line.includes('公司') || line.includes('企业') || line.includes('Co.,') || /^[A-Z]/.test(line)) {
      if (!experience.company) {
        experience.company = line;
      } else if (experience.company && !experience.position) {
        experience.position = line;
      }
    } else if (isDateLine(line)) {
      const dates = parseDateRange(line);
      if (!experience.startDate) {
        experience.startDate = dates.startDate;
        experience.endDate = dates.endDate;
      }
    } else if (line.length > 5) {
      experience.description += line + ' ';
      
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('·') || /\d+/.test(line)) {
        experience.highlights.push(line.replace(/^[•\-\·]\s*/, ''));
      }
    }
    
    i++;
  }
  
  return { experience, endIndex: i - 1 };
}

function parseProject(lines: string[], startIndex: number): { project: Project; endIndex: number } {
  const project: Project = {
    name: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    technologies: [],
    metrics: [],
  };
  
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (SECTION_PATTERNS.skill.test(line)) {
      break;
    }
    
    if (line.includes('项目') || line.includes('项目名称')) {
      if (!project.name) {
        project.name = line.replace(/项目名称[：:]\s*/, '');
      }
    } else if (line.includes('职责') || line.includes('角色') || /前端|后端|全栈|负责人|组长|成员/.test(line)) {
      if (!project.role) {
        project.role = line;
      }
    } else if (isDateLine(line)) {
      const dates = parseDateRange(line);
      if (!project.startDate) {
        project.startDate = dates.startDate;
        project.endDate = dates.endDate;
      }
    } else if (/技术栈|技术|框架/.test(line)) {
      project.technologies = line.split(/[,，、;:]/).map(s => s.trim()).filter(Boolean);
    } else if (line.length > 5) {
      project.description += line + ' ';
      
      const metricMatch = line.match(/\d+%|\d+倍|\d+个|\d+人|\d+万|\d+天/);
      if (metricMatch) {
        project.metrics.push(line);
      }
    }
    
    i++;
  }
  
  return { project, endIndex: i - 1 };
}

function parseSkills(lines: string[], startIndex: number): { skills: Skill[]; endIndex: number } {
  const skills: Skill[] = [];
  
  let i = startIndex;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (line.length > 0 && (isSkillSection(line) || /熟练|精通|掌握|了解/.test(line))) {
      const techs = line.split(/[,，、;|:：\n]/).map(s => s.trim()).filter(s => s.length > 0);
      
      techs.forEach(tech => {
        let level: '精通' | '熟练' | '了解' = '了解';
        if (/精通/.test(tech)) level = '精通';
        else if (/熟练/.test(tech)) level = '熟练';
        
        tech = tech.replace(/精通|熟练|掌握|了解/g, '').trim();
        
        if (tech.length > 0) {
          skills.push({
            name: tech,
            level,
            category: /英语|日语|韩语|语言/.test(tech) ? '语言' : '技术',
          });
        }
      });
    }
    
    i++;
  }
  
  return { skills, endIndex: i - 1 };
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
  
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentSection: 'basic' | 'education' | 'experience' | 'project' | 'skill' | null = null;
  let summaryLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    if (i < 5) {
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
      currentSection = 'basic';
      continue;
    }
    
    if (SECTION_PATTERNS.education.test(line)) {
      if (summaryLines.length > 0) {
        resume.sections.basic.summary = summaryLines.join(' ');
        summaryLines = [];
      }
      currentSection = 'education';
      const { education, endIndex } = parseEducation(lines, i + 1);
      if (education.school || education.degree) {
        resume.sections.education.push(education);
      }
      i = endIndex;
      continue;
    }
    
    if (SECTION_PATTERNS.experience.test(line)) {
      if (summaryLines.length > 0) {
        resume.sections.basic.summary = summaryLines.join(' ');
        summaryLines = [];
      }
      currentSection = 'experience';
      const { experience, endIndex } = parseExperience(lines, i + 1);
      if (experience.company || experience.description) {
        resume.sections.experience.push(experience);
      }
      i = endIndex;
      continue;
    }
    
    if (SECTION_PATTERNS.project.test(line)) {
      if (summaryLines.length > 0) {
        resume.sections.basic.summary = summaryLines.join(' ');
        summaryLines = [];
      }
      currentSection = 'project';
      const { project, endIndex } = parseProject(lines, i + 1);
      if (project.name || project.description) {
        resume.sections.projects.push(project);
      }
      i = endIndex;
      continue;
    }
    
    if (SECTION_PATTERNS.skill.test(line)) {
      if (summaryLines.length > 0) {
        resume.sections.basic.summary = summaryLines.join(' ');
        summaryLines = [];
      }
      currentSection = 'skill';
      const { skills, endIndex } = parseSkills(lines, i + 1);
      resume.sections.skills.push(...skills);
      i = endIndex;
      continue;
    }
    
    if (currentSection === 'basic' && line.length > 10) {
      summaryLines.push(line);
    }
  }
  
  if (summaryLines.length > 0 && !resume.sections.basic.summary) {
    resume.sections.basic.summary = summaryLines.join(' ');
  }
  
  if (resume.sections.education.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (SCHOOL_PATTERNS.test(line) && !resume.sections.education.some(e => e.school === line)) {
        const { education } = parseEducation(lines, i);
        if (education.school) {
          resume.sections.education.push(education);
        }
      }
    }
  }
  
  if (resume.sections.experience.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('公司') && line.length < 30) {
        const { experience } = parseExperience(lines, i);
        if (experience.company && !resume.sections.experience.some(e => e.company === experience.company)) {
          resume.sections.experience.push(experience);
        }
      }
    }
  }
  
  if (resume.sections.projects.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('项目') && line.length < 30) {
        const { project } = parseProject(lines, i);
        if (project.name && !resume.sections.projects.some(p => p.name === project.name)) {
          resume.sections.projects.push(project);
        }
      }
    }
  }
  
  return resume;
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
