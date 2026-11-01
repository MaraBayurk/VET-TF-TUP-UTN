import bcrypt from 'bcrypt';

export const encriptarPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};