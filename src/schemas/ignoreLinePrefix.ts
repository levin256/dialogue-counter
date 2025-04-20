import { z } from 'zod';
import { nonWhitespaceString } from '../types/string.schema';

export const ignoreLinePrefixSchema = z.object({
  id: z.string().uuid(),
  ignoreLinePrefix: nonWhitespaceString,
});

export type IgnoreLinePrefix = z.infer<typeof ignoreLinePrefixSchema>;

export const validateIgnoreLinePrefix = (
  ignoreLinePrefix: IgnoreLinePrefix,
) => {
  const result = ignoreLinePrefixSchema.safeParse(ignoreLinePrefix);
  return {
    success: result.success,
    messages: result.error?.format().ignoreLinePrefix?._errors ?? [],
  };
};
