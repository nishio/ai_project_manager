export interface Task {
  id?: string;
  title: string;
  status?: string;
  type?: string;
  description?: string;
  labels?: string[];
  assignable_to?: string[];
}

export interface Backlog {
  tasks: Task[];
}
