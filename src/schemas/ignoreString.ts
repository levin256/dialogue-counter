import { z } from 'zod';

export const ignoreStringSchema = z.object({
  id: z.string().uuid(),
  ignoreString: z.string().nonempty(),
});

export type IgnoreString = z.infer<typeof ignoreStringSchema>;
