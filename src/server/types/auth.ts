export type AppRole = "USER" | "ADMIN";

export type AccessTokenPayload = {
  sub: string;
  role: AppRole;
  type: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  sid: string;
  type: "refresh";
};
