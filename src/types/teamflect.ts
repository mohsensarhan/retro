// Teamflect API Types

export interface User {
  oid: string;
  displayName: string;
  userPrincipalName: string;
  mail?: string;
  department?: string;
  jobTitle?: string;
}

export interface Goal {
  id: string;
  createdBy: User;
  startDate: string;
  dueDate: string;
  owners: User[];
  title: string;
  description?: string;
  status?: 'on-track' | 'at-risk' | 'off-track' | 'completed';
  progress?: number;
  labels?: string[];
  keyResults?: KeyResult[];
}

export interface KeyResult {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  progress: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: User[];
  dueDate: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  createdBy: User;
  createdAt: string;
}

export interface Feedback {
  id: string;
  sender: User;
  recipient: User;
  message: string;
  type: 'praise' | 'constructive' | 'request';
  createdAt: string;
  isAnonymous?: boolean;
}

export interface Recognition {
  id: string;
  sender: User;
  recipient: User;
  title: string;
  message: string;
  createdAt: string;
  likes?: number;
}

export interface Review {
  id: string;
  reviewee: User;
  reviewer: User;
  period: string;
  status: 'draft' | 'in-progress' | 'completed';
  rating?: number;
  competencies?: Competency[];
  createdAt: string;
  completedAt?: string;
}

export interface Competency {
  id: string;
  name: string;
  rating: number;
  comments?: string;
}

// API Request/Response Types
export interface GetGoalsParams {
  userOID?: string;
  userUPN?: string;
  search?: string;
  selectedLabels?: string;
  limit?: number;
  skip?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetTasksParams {
  userOID?: string;
  status?: string;
  limit?: number;
  skip?: number;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  startDate: string;
  dueDate: string;
  ownerOIDs: string[];
  labels?: string[];
}

export interface UpdateGoalRequest {
  id: string;
  title?: string;
  description?: string;
  progress?: number;
  status?: string;
}

export interface SendFeedbackRequest {
  recipientOID: string;
  message: string;
  type: 'praise' | 'constructive' | 'request';
  isAnonymous?: boolean;
}

export interface CreateRecognitionRequest {
  recipientOID: string;
  title: string;
  message: string;
}

// Dashboard Analytics Types
export interface DashboardMetrics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  goalsOnTrack: number;
  goalsAtRisk: number;
  goalsOffTrack: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  teamSize: number;
  averageProgress: number;
  feedbackCount: number;
  recognitionCount: number;
}
