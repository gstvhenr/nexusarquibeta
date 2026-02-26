// --- Freelancer Types ---
export interface FreelancerProject {
  id: string;
  date: string;
  projectId?: string;
  projectName: string;
  description: string;
  cost: number;
  feedback: string;
}

export interface Freelancer {
  id: string;
  name: string;
  photo?: string;
  email: string;
  phone: string;
  portfolioLink?: string;
  specialties: string[];
  notes?: string;
  projects: FreelancerProject[];
  archived: boolean;
}

export type HiredServiceStatus = 'Em Andamento' | 'Concluído' | 'Cancelado';

export interface HiredService {
  id: string;
  projectId: string;
  freelancerId: string;
  taskIds: string[]; // IDs of the tasks delegated from the project
  cost: number;
  deadline: string; // YYYY-MM-DD
  status: HiredServiceStatus;
  createdAt: string; // ISO string
  archived?: boolean;
}
