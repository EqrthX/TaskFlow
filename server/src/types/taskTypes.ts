export interface CreateTaskData {
    title: string;
    description?: string;
    date: Date;
    userId: Int16Array; 
}