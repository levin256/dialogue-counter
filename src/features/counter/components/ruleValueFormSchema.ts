import { z } from 'zod/mini';
import { RuleValue } from '../domain/countRule';

export const ruleValueFormSchema = z.object({ value: RuleValue });
export type RuleValueFormInput = z.input<typeof ruleValueFormSchema>;
export type RuleValueFormOutput = z.output<typeof ruleValueFormSchema>;
