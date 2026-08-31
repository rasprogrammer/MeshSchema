import { prisma } from "@/config/prisma";
import { userRepository } from "@/repositories/user.repository";
import { BadRequestError, UnauthorizedError } from "@/utils/AppError";
import { comparePassword, hashPassword } from "@/utils/password";
import { ProfileUpdateInput, UpdatePasswordInput } from "@/validators/profile.validator";


export const profileService = {
    async update(userId: string, input: ProfileUpdateInput) {
        const user = await prisma.user.update({
            where: { id : userId },
            data : { name : input.name },
            select : {
                id: true, 
                name: true, 
                email: true,
                avatarUrl: true,
            }
        });

        return { user }; 
    },

    async updateAvatar(userId: string, avatarUrl: string) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
            }
        });

        return { user };
    },

    async updatePassword(userId: string, input: UpdatePasswordInput) {

        const { currentPassword, newPassword, confirmPassword } = input;

        const user = await userRepository.findById(userId);
        if (!user) {
          throw new UnauthorizedError("User not exists");
        }

        if (!user.passwordHash) {
          throw new BadRequestError(
            "This account has no password set (signed up via OAuth) — nothing to update"
          );
        }

        const valid = await comparePassword(currentPassword, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedError("Invalid password");
        }

        if (newPassword !== confirmPassword) {
            throw new BadRequestError("Confirm Password do not match");
        }

        const passwordHash = await hashPassword(input.newPassword);

        await userRepository.updatePassword({
            passwordHash,
            userId
        });

        return { message: "Password updated"};
    }
}