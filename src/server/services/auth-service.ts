import { prisma } from "@/server/lib/prisma";
import { AppError } from "@/server/lib/error";
import { hashPassword, verifyPassword } from "@/server/lib/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/server/lib/jwt";

const parseExpiresInToSeconds = (value: string): number => {
  const normalized = value.trim();
  const match = normalized.match(/^(\d+)([smhd])$/);

  if (!match) {
    return 60 * 60 * 24 * 7;
  }

  const quantity = Number(match[1]);
  const unit = match[2];

  const multiplier =
    unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 60 * 60 : 60 * 60 * 24;

  return quantity * multiplier;
};

export const registerUser = async (input: { name: string; email: string; password: string }) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new AppError(409, "EMAIL_ALREADY_USED", "Email is already registered");
  }

  const passwordHash = await hashPassword(input.password);

  const usersCount = await prisma.user.count();

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: usersCount === 0 ? "ADMIN" : "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginUser = async (input: { email: string; password: string; refreshExpiresIn: string }) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);

  if (!valid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const refreshSeconds = parseExpiresInToSeconds(input.refreshExpiresIn);
  const expiresAt = new Date(Date.now() + refreshSeconds * 1000);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: "pending",
      expiresAt,
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    type: "access",
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
    sid: session.id,
    type: "refresh",
  });

  const refreshTokenHash = await hashPassword(refreshToken);

  await prisma.session.update({
    where: { id: session.id },
    data: { refreshTokenHash },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const rotateRefreshToken = async (refreshToken: string, refreshExpiresIn: string) => {
  let payload: { sub: string; sid: string; type: "refresh" };

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
  }

  const session = await prisma.session.findUnique({ where: { id: payload.sid } });

  if (!session || session.userId !== payload.sub || session.expiresAt < new Date()) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token expired or revoked");
  }

  const matched = await verifyPassword(refreshToken, session.refreshTokenHash);

  if (!matched) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token mismatch");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "User not found for refresh token");
  }

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    type: "access",
  });

  const refreshSeconds = parseExpiresInToSeconds(refreshExpiresIn);
  const newExpiresAt = new Date(Date.now() + refreshSeconds * 1000);

  const newRefreshToken = signRefreshToken({
    sub: user.id,
    sid: session.id,
    type: "refresh",
  });

  const newRefreshTokenHash = await hashPassword(newRefreshToken);

  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: newExpiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const revokeRefreshToken = async (refreshToken: string) => {
  let payload: { sid: string; type: "refresh"; sub: string };

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      id: payload.sid,
      userId: payload.sub,
    },
  });
};
