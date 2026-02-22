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

export const UpdateTaskStatusServices = async (id: number, isDone: boolean, userId: string) => {
    return await prisma.task.update({
        where: {
            id: id,
            userId: userId
        },
        data: {
            isDone: isDone
        }
    })
}

export const UpdateTaskServices = async (id: number, title: string, description: string, userId: string) => {
    return prisma.task.update({
        where: {
            id: id,
            userId: userId
        },
        data: {
            title: title,
            description: description
        }
    })
}

export const DeleteTaskServices = async(id: number, userId: string) => {
    return await prisma.task.delete({
        where:{
            id: id,
            userId: userId
        }
    })
} 