import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { Session } from 'express-session'

// Augment the existing Request interface

interface CustomSession extends Session {
  userId?: number; // Add the userId property
}

interface CustomRequest extends Request {
  session: CustomSession;
}

export interface Context {
  prisma: PrismaClient
  req: CustomRequest
  res: Response
}

const prisma = new PrismaClient()

export const createContext = async ({ req, res }: { req: CustomRequest, res: Response }) => ({
  prisma: prisma,
  req: req,
  res: res
})