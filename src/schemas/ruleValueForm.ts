import { z } from 'zod';
import { nonWhitespaceString } from '../types/string.schema';

export const ruleValueFormSchema = z.object({
  value: nonWhitespaceString,
});
export type RuleValueForm = z.infer<typeof ruleValueFormSchema>;
