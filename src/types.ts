export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Pending' | 'In Progress' | 'Completed';
export type PaymentStatus = 'Pending' | 'Paid';

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  deadline: string;
  progress: number;
  amount: number;
  teamMembers: string[];
  files: string[];
}

export interface Payment {
  id: string;
  clientName: string;
  amount: number;
  status: PaymentStatus;
  date: string;
}

export interface Activity {
  id: string;
  type: 'task' | 'project' | 'payment';
  message: string;
  timestamp: string;
}
