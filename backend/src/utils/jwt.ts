import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn,
  };
  return jwt.sign(payload, config.jwt.secret, options);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: '30d', // Refresh token expires in 30 days
  };
  return jwt.sign(payload, config.jwt.secret, options);
};
