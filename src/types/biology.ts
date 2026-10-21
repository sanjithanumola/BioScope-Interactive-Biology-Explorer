export type SectionId =
  | 'home'
  | 'anatomy'
  | 'cell'
  | 'dna'
  | 'systems'
  | 'microscopic'
  | 'lab'
  | 'quizzes'
  | 'progress'
  | 'settings';

export type BodySystemCategory =
  | 'circulatory'
  | 'respiratory'
  | 'digestive'
  | 'nervous'
  | 'urinary'
  | 'skeletal'
  | 'muscular'
  | 'endocrine'
  | 'immune'
  | 'reproductive';

export interface OrganData {
  id: string;
  name: string;
  latinName: string;
  system: BodySystemCategory;
  location: string;
  primaryFunction: string;
  structures: string[];
  facts: string[];
  pathologyNotice?: string;
  coordinates: { x: number; y: number; width?: number; height?: number };
}

export interface OrganelleData {
  id: string;
  name: string;
  role: string;
  foundIn: 'both' | 'animal' | 'plant';
  function: string;
  atpOrProteinRole: string;
  facts: string[];
  color: string;
  highlightColor: string;
  coordinates: { cx: number; cy: number; r?: number; path?: string };
}

export interface BodySystemData {
  id: BodySystemCategory;
  name: string;
  tagline: string;
  purpose: string;
  majorOrgans: string[];
  howItWorks: string[];
  connections: { system: string; description: string }[];
  keyVocabulary: { term: string; definition: string }[];
  knowledgeCheck: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface MicroscopicEntity {
  id: string;
  name: string;
  type: 'cell' | 'microorganism' | 'tissue' | 'organelle' | 'molecule';
  sizeString: string;
  sizeMeters: number; // For logarithmic scale
  structure: string;
  function: string;
  whereFound: string;
  facts: string[];
  microscopeDescription: string;
}

export interface QuizQuestion {
  id: string;
  topic: 'anatomy' | 'cell' | 'dna' | 'systems' | 'microscopic';
  question: string;
  type: 'mcq' | 'true-false' | 'identification';
  options: string[];
  correctAnswer: number | string; // index or organ/organelle id
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'anatomy' | 'cell' | 'dna' | 'lab' | 'quiz' | 'mastery';
  xpReward: number;
}

export interface GlossaryEntry {
  term: string;
  pronunciation?: string;
  category: 'Anatomy' | 'Cytology' | 'Genetics' | 'Physiology' | 'Microbiology' | 'Ecology';
  simpleDefinition: string;
  detailedExplanation: string;
  relatedTerms: string[];
  relatedSection: SectionId;
}

export interface UserProgress {
  xp: number;
  completedTopics: Record<string, boolean>;
  topicProgress: Record<string, number>; // 0 to 100
  streakDays: number;
  lastActiveDate: string;
  unlockedAchievements: string[];
  bookmarkedItems: { id: string; title: string; section: SectionId; category: string }[];
  quizHistory: {
    id: string;
    topic: string;
    score: number;
    total: number;
    percentage: number;
    date: string;
  }[];
  lastVisitedSection: SectionId;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  reducedMotion: boolean;
  soundEnabled: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}
