export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
  achievements: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
}

export interface HobbyItem {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
}

export interface SkillCategory {
  title: string;
  items: string[];
}

export interface PortfolioData {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatarPlaceholder: string;
  contact: {
    email: string;
    github: string;
    linkedin: string;
    twitter: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  projects?: ProjectItem[];
  hobbies: HobbyItem[];
  skills: SkillCategory[];
}

export const portfolioData: PortfolioData = {
  name: "Koo Weng Seng",
  title: "Full-Stack Software Engineer ",
  tagline: "Building high-performance web interfaces with pixel-perfect layouts.",
  bio: "I am a Senior Full-Stack Web Developer with extensive experience designing, developing, and maintaining scalable enterprise applications and corporate systems. Skilled in translating business requirements into robust technical solutions, optimizing system performance, and delivering high-quality software across the full development lifecycle. Seeking opportunities to contribute technical leadership, drive innovation, and support business growth through effective software development and team collaboration",
  avatarPlaceholder: "AM",
  contact: {
    email: "wengsengae86@gmail.com",
    github: "github.com/wengseng300",
    linkedin: "linkedin.com/in/koo-weng-seng-165327109/",
    twitter: ""
  },
  experience: [
    {
      id: "exp1",
      role: "Senior Software Engineer",
      company: "Tricor Senedi/Tricor SSC",
      period: "May 2013 - December 2020",
      description: "Leading the next-generation client component rendering frameworks. Focused on runtime optimization, hydration performance, and visual fidelity.",
      bullets: [
        "Provided on-site and remote application support for corporate clients, working directly with business users to investigate issues, gather requirements, deliver enhancements, and ensure system stability.",
        "Led multiple application modernization initiatives, analyzing legacy codebases and redesigning workflows using modern development practices and architectural improvements to enhance system maintainability, performance, scalability, and user experience.",
        "Designed and implemented automation and process optimization solutions that transformed manual business operations into streamlined digital workflows, including a payroll reporting system that reduced report generation time from 5–7 days to under 30 minutes.",
		"Partnered with business stakeholders and end users throughout the project lifecycle to gather requirements, manage scope and change requests, provide technical consultation, and translate business objectives into scalable, maintainable solutions while ensuring timely project delivery.",
		"Led end-to-end delivery of enterprise software projects across the full SDLC, from requirements analysis and solution design, development, testing, deployment, and post-production support, including project estimation, task planning, resource allocation, and delivery oversight.",
		"Led and mentored development teams across multiple projects, coordinating task assignments based on individual expertise, reviewing code quality, establishing development standards, promoting best practices, and ensuring compliance with development processes to achieve successful project delivery."
      ]
    },
    {
      id: "exp2",
      role: "Business Operation Support",
      company: "Family-Owned Real Estate Company",
      period: "Jan 2023 - May 2026",
      description: "Engineered high-security merchant integrations, payment flows, and micro-animations for Stripe Checkout platforms.",
      bullets: [
		"Supported operational management activities, including transaction verification, documentation review and payment authorization.",
		"Reviewed existing business procedures and identified opportunities for process simplification, implementing digital workflows that reduced manual paperwork and improved operational efficiency.",
		"Assisted in maintaining business continuity and operational efficiency due to family medical situation."
      ]
    },
  ],
  education: [
    {
      id: "edu1",
      degree: "BSc (Hons) Degree in Business Information Technology",
      institution: "INTI COLLEGE SUBANG JAYA",
      period: "May 2007 - Mar 2012",
      description: "",
      achievements: []
    },
    {
      id: "edu2",
      degree: "Diploma in Computer Studies",
      institution: "INFORMATICS COLLEGE",
      period: "May 2006 - Mar 2007",
      description: "",
      achievements: []
    }
  ],
  hobbies: [
    {
      id: "hob1",
      name: "Gym, Exercise & Workout",
      icon: "gym",
      description: "Very active in performing gym and workout activities at least 3-5 times per week."
    },
    {
      id: "hob2",
      name: "Learning new languages",
      icon: "chat",
      description: "Love to explore and learn foreign languages. Mostly self-learning through online videos and language learning mobile apps like Duolingo & Memrise."
    },
    {
      id: "hob3",
      name: "Cats",
      icon: "cat",
      description: "Living with my 2 cats: Nana & Jerry."
    },
    {
      id: "hob4",
      name: "Foodie",
      icon: "hamburger",
      description: "Love exploring new foods from different cuisines and cultures but also down-to-earth."
    }
  ],
  skills: [
    {
      title: "Languages",
      items: ["C#", "VB.NET", ".NET Framework", "Python", "Flutter/Dart", "T-SQL"]
    },
    {
      title: "Frontend/Framework",
      items: ["ASP.NET", "MVC", "HTML5/CSS3", "JavaScript", "JQuery", "AJAX", "Boostrap", "Flatlab"]
    },
    {
      title: "Backend & Systems",
      items: ["Node.js", "Express", "Drizzle ORM", "Docker", "Wasm Compiler Bindings", "REST APIs"]
    },
    {
      title: "Database",
      items: ["Microsoft SQL Server", "Stored Procedure", "Query Optimization", "Performance Tuning"]
    }
  ]
};
