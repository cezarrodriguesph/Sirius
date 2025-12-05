
export type Role = 'TEACHER' | 'COORDINATOR';
export type DeviceMode = 'DESKTOP' | 'MOBILE';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  registrationNumber: string;
}

export interface ClassSchedule {
  dayOfWeek: number; // 0-6 (0=Sunday)
  lessonsCount: number; 
}

export interface Lesson {
  id: string;
  classId: string;
  date: string; // ISO YYYY-MM-DD
  topic: string;
  content: string;
  completed: boolean;
  lessonIndex: number; // 1, 2, 3... for the day
}

export interface Assessment {
  id: string;
  classId: string;
  title: string;
  maxScore: number;
  weight: number;
}

// StudentID -> AssessmentID -> Score (as string to handle empty states)
export type GradeMap = Record<string, Record<string, string>>;

export interface ClassGroup {
  id: string;
  teacherId: string;
  name: string; // e.g. "3º Ano A"
  subject: string; // e.g. "Matemática"
  schedule: ClassSchedule[]; 
  students: Student[];
  planningText?: string;
  lessons: Lesson[]; // Persisted lessons
  grades: GradeMap; // Persisted grades
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  DIARY = 'DIARY',
  GRADES = 'GRADES',
  STUDENTS = 'STUDENTS',
}