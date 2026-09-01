import { randomBytes } from "crypto";
import { projectInviteRepository } from "@/repositories/projectInvite.repository";
import { projectMemberRepository } from "@/repositories/projectMember.repository";
import { requireProjectRole } from "./projectAccess.service";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/utils/AppError";
import { ProjectRole } from "@/config/prisma";
import { CreateInviteInput } from "@/validators/projectInvite.validator";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const projectInviteService = {
  async create(projectId: string, inviterId: string, input: CreateInviteInput) {
    await requireProjectRole(projectId, inviterId, "OWNER");

    const token = randomBytes(24).toString("base64url");
    const invite = await projectInviteRepository.create({
      projectId,
      email: input.email.toLowerCase(),
      role: input.role as ProjectRole,
      token,
      invitedBy: inviterId,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    });

    return invite;
  },

  async list(projectId: string, userId: string) {
    await requireProjectRole(projectId, userId, "OWNER");
    return projectInviteRepository.listPendingByProject(projectId);
  },

  async revoke(projectId: string, inviteId: string, userId: string) {
    await requireProjectRole(projectId, userId, "OWNER");
    const invite = await projectInviteRepository.findById(inviteId);
    if (!invite || invite.projectId !== projectId) throw new NotFoundError("Invite not found");
    await projectInviteRepository.revoke(inviteId);
  },

  /** Accepting user must be signed in with the same email the invite was sent to. */
  async accept(token: string, currentUser: { id: string; email: string }) {
    const invite = await projectInviteRepository.findByToken(token);
    if (!invite || invite.status !== "PENDING") {
      throw new NotFoundError("Invite not found or already used");
    }
    if (invite.expiresAt < new Date()) {
      throw new BadRequestError("This invite has expired");
    }
    if (invite.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      throw new ForbiddenError("This invite was sent to a different email address");
    }

    await projectMemberRepository.upsert(invite.projectId, currentUser.id, invite.role);
    await projectInviteRepository.markAccepted(invite.id);

    return { projectId: invite.projectId, role: invite.role };
  },
};
