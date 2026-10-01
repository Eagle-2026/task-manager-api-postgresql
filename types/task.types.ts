

export interface ITask {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface TaskQuery {
  page?: string;
  limit?: string;
  completed?: string;
  search?: string;
  sort?: string;
}