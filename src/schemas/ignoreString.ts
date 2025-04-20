import { z } from 'zod';
import { nonWhitespaceString } from '../types/string.schema';

export const ignoreStringSchema = z.object({
  id: z.string().uuid(),
  ignoreString: nonWhitespaceString,
});

export type IgnoreString = z.infer<typeof ignoreStringSchema>;

export const validateIgnoreString = (ignoreString: IgnoreString) => {
  const result = ignoreStringSchema.safeParse(ignoreString);
  return {
    success: result.success,
    messages: result.error?.format().ignoreString?._errors ?? [],
  };
};
