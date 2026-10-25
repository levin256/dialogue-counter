import { z } from 'zod/mini';
import { RuleValue } from '../utils/string';

export const ruleValueFormSchema = z.object({ value: RuleValue });
export type RuleValueFormInput = z.input<typeof ruleValueFormSchema>;
export type RuleValueFormOutput = z.output<typeof ruleValueFormSchema>;
