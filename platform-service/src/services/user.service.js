import prisma from "../lib/prisma.js";

export const createUser = async ({ phone, email, name }) => {
    if (!phone) throw new Error("PHONE_REQUIRED");

    const existing = await prisma.user.findFirst({
        where: { OR: [{ phone }, { email }] },
    });

    if (existing) throw new Error("USER_ALREADY_EXISTS");

    return prisma.user.create({
        data: { phone, email, name },
    });
};

export const listUsers = async () => {
    return prisma.user.findMany({
        include: {
            profiles: { include: { sport: true } },
        },
    });
};

export const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            profiles: { include: { sport: true } },
            sessions: true,
        },
    });

    if (!user) throw new Error("USER_NOT_FOUND");
    return user;
};

export const updateUser = async (id, data) => {
    return prisma.user.update({
        where: { id },
        data,
    });
};
