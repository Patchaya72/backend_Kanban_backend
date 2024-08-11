export interface ColumnGetResspones {
    column_id:   number;
    column_name: string;
    board_id:    number;
    tasks:       Task[];
}

export interface Task {
    task_id:     number;
    task_title:  string;
    description: string;
    due_date:    string;
    column_id:   number;
}
