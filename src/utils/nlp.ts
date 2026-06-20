import { portfolioData } from "../data/portfolio";

export type PortfolioCategory = 
  | "experience"
  | "education"
  | "projects"
  | "hobbies"
  | "skills"
  | "contact"
  | "about"
  | "all"
  | "invalid"
  | "none";

interface MatchResult {
  category: PortfolioCategory;
  conversationalIntro: string;
  matchedKeywords: string[];
}

export function parseQuery(rawQuery: string): MatchResult {
  const query = rawQuery.toLowerCase().trim();
  
  if (!query) {
    return {
      category: "none",
      conversationalIntro: "Type or speak below to ask me anything about my portfolio!",
      matchedKeywords: []
    };
  }

  // 1. Definition of keyword lists for robust mapping
  const matchers: { category: PortfolioCategory; keywords: string[] }[] = [
    {
      category: "experience",
      keywords: ["experience", "work", "job", "career", "employment", "employer", "company", "stripe", "vercel", "jetbrains", "role", "history", "resume", "positions"]
    },
    {
      category: "education",
      keywords: ["education", "study", "university", "college", "school", "degree", "academic", "mit", "stanford", "gpa", "major", "learn", "studied"]
    },
    {
      category: "projects",
      keywords: ["projects", "project", "build", "apps", "code", "make", "developed", "portfolio", "git", "github", "omniedit", "quartz", "aura", "sound", "editor", "compiler"]
    },
    {
      category: "hobbies",
      keywords: ["hobby", "hobbies", "interest", "interests", "free time", "guitar", "climb", "climbing", "bouldering", "hiking", "keyboard", "typography", "sport", "enjoy", "fun", "music"]
    },
    {
      category: "skills",
      keywords: ["skills", "skill", "tech", "languages", "coding", "technologies", "stack", "react", "typescript", "rust", "framework", "figma", "node"]
    },
    {
      category: "contact",
      keywords: ["contact", "email", "phone", "hire", "talk", "chat", "message", "linkedin", "twitter", "reach", "social"]
    },
    {
      category: "about",
      keywords: ["who", "about", "bio", "yourself", "profile", "alex", "morgan", "name", "whois", "hello", "hi", "hey", "greet", "greetings"]
    }
  ];

  // Look for fully matched keywords
  const matchedKeywords: string[] = [];
  const scores = new Map<PortfolioCategory, number>();

  for (const matcher of matchers) {
    let score = 0;
    for (const kw of matcher.keywords) {
      if (query.includes(kw)) {
        score += 2; // Direct substring matches get high score
        matchedKeywords.push(kw);
      }
    }
    if (score > 0) {
      scores.set(matcher.category, score);
    }
  }

  // Determine highest scoring category
  let bestCategory: PortfolioCategory = "none";
  let highestScore = 0;

  for (const [category, score] of scores.entries()) {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }

  // Check if user specifically asks to see "everything" or "all"
  if (query.includes("everything") || query.includes("all details") || query.includes("summary")) {
    bestCategory = "all";
  }

  // 2. Generate natural custom conversational response text
  let intro = "";
  switch (bestCategory) {
    case "experience":
      intro = `I've spent the past 6+ years constructing high-performance software, specifically focusing on core libraries at Vercel, optimized checkout experiences at Stripe, and workspace user workflows at JetBrains. Here is my professional career timeline:`;
      break;
    case "education":
      intro = `My academic studies provided me with a rigorous foundation in algorithms and visual compilers. I received an M.S. in Computer Science from Stanford University and a B.S. in Software Engineering from MIT. Here are the core details of my academic background:`;
      break;
    case "projects":
      intro = `I love releasing open-source developer applications. Here are three highlights—including OmniEdit, a collaborative room editor, and Quartz, a Rust-compiled style helper:`;
      break;
    case "hobbies":
      intro = `I have a deep passion for tactile and musical crafts that let me slow down and focus. Here are a few creative and sporting activities I spend time on when I am offline:`;
      break;
    case "skills":
      intro = `I work across full-stack ecosystems, building highly accessible Frontends and memory-safe compiled systems. Here is a classified matrix of my tools, languages, and competencies:`;
      break;
    case "contact":
      intro = `I am always looking forward to technical exchanges, software collaborations, and workspace discussions! Feel free to reach out using any of the direct links below:`;
      break;
    case "about":
      intro = `Hello! I am ${portfolioData.name}, a ${portfolioData.title.toLowerCase()}. ${portfolioData.bio} Ask me about my working experience, academic background, projects, technical skills, or hobbies!`;
      break;
    case "all":
      intro = `Here is a comprehensive overview of my complete portfolio profile! Toggle individual tabs below or ask any tailored question about specific categories:`;
      break;
    default:
      // Search didn't score any category, but we can see if they ask a general question and give an elegant response
      intro = `That sounds like an interesting question! To make browsing easy, here is what is in my interactive portfolio profile. Tap any topic below or ask about specific categories like "working experience", "education", "engineering skills", "hobbies", or "projects":`;
      break;
  }

  return {
    category: bestCategory,
    conversationalIntro: intro,
    matchedKeywords
  };
}
