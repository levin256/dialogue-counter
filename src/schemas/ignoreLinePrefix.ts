import { z } from 'zod';
import { nonWhitespaceString } from '../types/string.schema';

export const ignoreLinePrefixFormSchema = z.object({
  ignoreLinePrefix: nonWhitespaceString,
});
export type IgnoreLinePrefixForm = z.infer<typeof ignoreLinePrefixFormSchema>;
