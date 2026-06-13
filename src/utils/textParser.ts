import type { Resume, BasicInfo, Education, Experience, Project, Skill } from '@/types/resume';

export function parseTextToResume(text: string): Resume {
  const lines = text.split('\n').filter(line => line.trim());
  
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
  
  let currentSection: 'basic' | 'education' | 'experience' | 'project' | 'skill' | null = null;
  let currentEducation: Education | null = null;
  let currentExperience: Experience | null = null;
  let currentProject: Project | null = null;
  let summaryLines: string[] = [];
  
  const sectionKeywords = {
    basic: ['姓名', '电话', '邮箱', '邮箱', '地址', '个人简介', '简介'],
    education: ['教育', '学历', '学校', '毕业', '大学', '学院'],
    experience: ['工作', '实习', '经历', '经验', '公司'],
    project: ['项目', '作品'],
    skill: ['技能', '技术', '能力', '语言'],
  };
  
  function detectSection(line: string): 'basic' | 'education' | 'experience' | 'project' | 'skill' | null {
    const lowerLine = line.toLowerCase();
    
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => lowerLine.includes(keyword))) {
        return section as any;
      }
    }
    
    return null;
  }
  
  function isEmail(text: string): boolean {
    return /[\w.-]+@[\w.-]+\.\w+/.test(text);
  }
  
  function isPhone(text: string): boolean {
    return /1[3-9]\d{9}/.test(text);
  }
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) return;
    
    if (index < 5 && (isEmail(trimmedLine) || isPhone(trimmedLine) || /^[A-Z\u4e00-\u9fa5]{2,4}$/.test(trimmedLine))) {
      if (/^[A-Z\u4e00-\u9fa5]{2,4}$/.test(trimmedLine) && !resume.sections.basic.name) {
        resume.sections.basic.name = trimmedLine;
        currentSection = 'basic';
        return;
      }
      
      if (isEmail(trimmedLine)) {
        resume.sections.basic.email = trimmedLine;
        currentSection = 'basic';
        return;
      }
      
      if (isPhone(trimmedLine)) {
        resume.sections.basic.phone = trimmedLine;
        currentSection = 'basic';
        return;
      }
    }
    
    if (trimmedLine.includes('个人简介') || trimmedLine.includes('简介')) {
      currentSection = 'basic';
      return;
    }
    
    if (currentSection === 'basic' && !isEmail(trimmedLine) && !isPhone(trimmedLine)) {
      if (detectSection(trimmedLine)) {
        currentSection = detectSection(trimmedLine);
      } else if (!resume.sections.basic.summary && trimmedLine.length > 20) {
        summaryLines.push(trimmedLine);
        if (index === lines.length - 1 || detectSection(lines[index + 1])) {
          resume.sections.basic.summary = summaryLines.join(' ');
          summaryLines = [];
        }
      }
    }
    
    if (trimmedLine.includes('教育')) {
      currentSection = 'education';
      return;
    }
    
    if (currentSection === 'education') {
      if (detectSection(trimmedLine) === 'experience') {
        if (currentEducation) {
          resume.sections.education.push(currentEducation);
        }
        currentEducation = null;
        currentSection = 'experience';
        return;
      }
      
      if (!currentEducation) {
        currentEducation = {
          school: trimmedLine,
          degree: '',
          major: '',
          startDate: '',
          endDate: '',
        };
      } else if (!currentEducation.degree) {
        currentEducation.degree = trimmedLine;
      } else if (!currentEducation.major) {
        currentEducation.major = trimmedLine;
      } else {
        const dateMatch = trimmedLine.match(/\d{4}/g);
        if (dateMatch) {
          currentEducation.startDate = dateMatch[0];
          if (dateMatch[1]) {
            currentEducation.endDate = dateMatch[1];
          }
        }
      }
    }
    
    if (trimmedLine.includes('工作') || trimmedLine.includes('实习')) {
      if (currentExperience) {
        resume.sections.experience.push(currentExperience);
      }
      currentSection = 'experience';
      currentExperience = {
        company: trimmedLine,
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        highlights: [],
      };
      return;
    }
    
    if (currentSection === 'experience' && currentExperience) {
      if (detectSection(trimmedLine) === 'project') {
        resume.sections.experience.push(currentExperience);
        currentExperience = null;
        currentSection = 'project';
        return;
      }
      
      if (detectSection(trimmedLine) === 'skill') {
        resume.sections.experience.push(currentExperience);
        currentExperience = null;
        currentSection = 'skill';
        return;
      }
      
      if (!currentExperience.position) {
        currentExperience.position = trimmedLine;
      } else if (!currentExperience.startDate) {
        const dateMatch = trimmedLine.match(/\d{4}/g);
        if (dateMatch) {
          currentExperience.startDate = dateMatch[0];
          if (dateMatch[1]) {
            currentExperience.endDate = dateMatch[1];
          }
        }
      } else {
        currentExperience.description += trimmedLine + ' ';
      }
    }
    
    if (trimmedLine.includes('项目')) {
      if (currentProject) {
        resume.sections.projects.push(currentProject);
      }
      currentSection = 'project';
      currentProject = {
        name: trimmedLine,
        role: '',
        startDate: '',
        endDate: '',
        description: '',
        technologies: [],
      };
      return;
    }
    
    if (currentSection === 'project' && currentProject) {
      if (detectSection(trimmedLine) === 'skill') {
        resume.sections.projects.push(currentProject);
        currentProject = null;
        currentSection = 'skill';
        return;
      }
      
      if (!currentProject.role) {
        currentProject.role = trimmedLine;
      } else if (!currentProject.startDate) {
        const dateMatch = trimmedLine.match(/\d{4}/g);
        if (dateMatch) {
          currentProject.startDate = dateMatch[0];
          if (dateMatch[1]) {
            currentProject.endDate = dateMatch[1];
          }
        }
      } else {
        currentProject.description += trimmedLine + ' ';
      }
    }
    
    if (trimmedLine.includes('技能') || trimmedLine.includes('技术')) {
      currentSection = 'skill';
      return;
    }
    
    if (currentSection === 'skill') {
      resume.sections.skills.push({
        name: trimmedLine,
        level: '了解',
        category: '技术',
      });
    }
  });
  
  if (currentEducation) {
    resume.sections.education.push(currentEducation);
  }
  if (currentExperience) {
    resume.sections.experience.push(currentExperience);
  }
  if (currentProject) {
    resume.sections.projects.push(currentProject);
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
