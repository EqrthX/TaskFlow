import prisma from "../config/db";

export const AddTaskServices = async (data: any) => {

    const newTask = await prisma.task.create({
        data: {
            title: data.title,
            description: data.description, 
            date: data.date,               
            userId: data.userId            
        }
    });

    return newTask;
}