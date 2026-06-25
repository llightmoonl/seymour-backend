export interface JwtPayload {
  id: string;
  role: string;
  sessionId: string;
}

export interface RequestUser {
  id: string;
  role: string;
  sessionId: string;
}
