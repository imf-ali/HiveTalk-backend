import jwt from 'jsonwebtoken';

export const createToken = (userId: number) : string => {
	try {
		const token = jwt.sign({ _id: userId }, 'graphqlapis');
		return token;
	} catch (err) {
		throw err;
	}
};

export const extractUserId = (token: string): number => {
  try {
     const decoded = jwt.verify(token, 'graphqlapis');
     return (<any>decoded)._id;
  } catch (err) {
    throw err;
  }
};
