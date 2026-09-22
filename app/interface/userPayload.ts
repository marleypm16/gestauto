export interface UserPayload {
  id: string;
  email: string;
  nome: string;
  empresaId: string;
  iat?: number;
  exp?: number;
}