import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

export const createToken = (userId: number) : string => {
	try {
		const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET!);
		return token;
	} catch (err) {
		throw err;
	}
};

export const extractUserId = (token: string): number => {
  try {
     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
     return (<any>decoded)._id;
  } catch (err) {
    throw err;
  }
};
