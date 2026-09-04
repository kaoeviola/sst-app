import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export type MobileUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  companyId: string;
};

type MobileToken = JWTPayload & {
  type: "access" | "refresh";
  role: string;
  companyId: string;
};

function getSecret() {
  const value = process.env.MOBILE_JWT_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!value) {
    throw new Error("MOBILE_JWT_SECRET nao configurado.");
  }

  return new TextEncoder().encode(value);
}

export async function issueMobileTokens(user: MobileUser) {
  const secret = getSecret();
  const baseClaims = {
    sub: user.id,
    role: user.role,
    companyId: user.companyId
  };

  const accessToken = await new SignJWT({ ...baseClaims, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);

  const refreshToken = await new SignJWT({ ...baseClaims, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return { accessToken, refreshToken };
}

export async function verifyMobileToken(token: string, expectedType: MobileToken["type"]) {
  const { payload } = await jwtVerify<MobileToken>(token, getSecret(), {
    algorithms: ["HS256"]
  });

  if (payload.type !== expectedType || !payload.sub || !payload.companyId || !payload.role) {
    throw new Error("Token mobile invalido.");
  }

  return payload;
}

export function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

export async function mobileAccessClaims(request: Request) {
  const token = bearerToken(request);
  if (!token) return null;

  try {
    return await verifyMobileToken(token, "access");
  } catch {
    return null;
  }
}
