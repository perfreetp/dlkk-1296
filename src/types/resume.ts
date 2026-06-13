export interface BasicInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

export interface Education {
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  GPA?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface Project {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  metrics?: string[];
}

export interface Skill {
  name: string;
  level: '精通' | '熟练' | '了解';
  category: '技术' | '语言' | '软技能';
}

export interface Resume {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  sections: {
    basic: BasicInfo;
    education: Education[];
    experience: Experience[];
    projects: Project[];
    skills: Skill[];
  };
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  name: string;
  createdAt: Date;
  resume: Resume;
}
