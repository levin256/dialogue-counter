import { z } from 'zod';
import { nonWhitespaceString } from '../types/string.schema';

export const ignoreStringFormSchema = z.object({
  ignoreString: nonWhitespaceString,
});
export type IgnoreStringForm = z.infer<typeof ignoreStringFormSchema>;
