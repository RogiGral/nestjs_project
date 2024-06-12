import * as bcrypt from 'bcrypt';

export const GeneratePassword = async (
  password: string,
  saltRounds: number,
) => {
  return await bcrypt.hash(password, saltRounds);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};
