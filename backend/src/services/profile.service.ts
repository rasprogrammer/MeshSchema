import { prisma } from "@/config/prisma";
import { ProfileUpdateInput } from "@/validators/profile.validator";


export const profileService = {
    async update(userId: string, input: ProfileUpdateInput) {
        const user = await prisma.user.update({
            where: { id : userId },
            data : { name : input.name },
            select : {
                id: true, 
                name: true, 
                email: true,
            }
        });

        return { user }; 
    }
}