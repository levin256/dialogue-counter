import { z } from 'zod';
import { nonWhitespaceString } from '../types/string.schema';

export const ignoreLinePrefixSchema = z.object({
  id: z.string().uuid(),
  ignoreLinePrefix: nonWhitespaceString,
});
export type IgnoreLinePrefix = z.infer<typeof ignoreLinePrefixSchema>;

export const ignoreLinePrefixFormSchema = ignoreLinePrefixSchema.omit({
  id: true,
});
export type IgnoreLinePrefixForm = z.infer<typeof ignoreLinePrefixFormSchema>;
