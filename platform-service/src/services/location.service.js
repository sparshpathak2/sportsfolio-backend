import { prisma } from "../../lib/prisma.js";

export const createLocation = async ({
    name,
    address,
    city,
    state,
    country,
    zipCode,
}) => {
    if (!name || !city || !state) {
        throw new Error("LOCATION_NAME_CITY_STATE_REQUIRED");
    }

    return prisma.location.create({
        data: {
            name,
            address,
            city,
            state,
            country,
            zipCode,
        },
    });
};

export const listLocations = async () => {
    return prisma.location.findMany({
        orderBy: { createdAt: "desc" },
    });
};

export const getLocationById = async (id) => {
    const location = await prisma.location.findUnique({ where: { id } });
    if (!location) throw new Error("LOCATION_NOT_FOUND");
    return location;
};

export const updateLocation = async (id, data) => {
    return prisma.location.update({
        where: { id },
        data,
    });
};
