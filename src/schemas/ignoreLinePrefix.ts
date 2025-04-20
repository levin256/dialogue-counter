import { z } from 'zod';

export const ignoreLinePrefixSchema = z.object({
  id: z.string().uuid(),
  ignoreLinePrefix: z.string().nonempty(),
});

export type IgnoreLinePrefix = z.infer<typeof ignoreLinePrefixSchema>;
