import { prisma } from "../lib/prisma";
import { randomUUID } from "crypto";

export const logAudit = async ({
  userId,
  action,
  entity,
  entityId,
  before,
  after,
}: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: any;
  after?: any;
}) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      before,
      after,
      correlationId: randomUUID(),
    },
  });
};