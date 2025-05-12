import { z } from 'zod';
import { nonWhitespaceString } from '../types/string.schema';

export const ignoreStringSchema = z.object({
  id: z.string().uuid(),
  ignoreString: nonWhitespaceString,
});
export type IgnoreString = z.infer<typeof ignoreStringSchema>;

export const ignoreStringFormSchema = ignoreStringSchema.omit({ id: true });
export type IgnoreStringForm = z.infer<typeof ignoreStringFormSchema>;
