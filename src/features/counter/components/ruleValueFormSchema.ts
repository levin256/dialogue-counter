import { z } from 'zod/mini';
import { RuleValue, RuleValueError } from '../domain/countRule';

/**
 * 値を追加するフォームの schema を作る。
 * 空・空白だけの値に加えて、登録済みの値もエラーにする（理由のコードは duplicate）。
 *
 * @param registered 登録済みの値
 */
export const createRuleValueFormSchema = (registered: readonly RuleValue[]) =>
  z.object({
    value: RuleValue.check(
      z.refine(
        (value) => !registered.includes(value),
        'duplicate' satisfies RuleValueError,
      ),
    ),
  });
/** フォームに入力された値（検証の前）。 */
export type RuleValueFormInput = z.input<
  ReturnType<typeof createRuleValueFormSchema>
>;
/** 検証を通った値。value は登録できる RuleValue になっている。 */
export type RuleValueFormOutput = z.output<
  ReturnType<typeof createRuleValueFormSchema>
>;

const ERROR_MESSAGES: Record<RuleValueError, string> = {
  empty: '文字を入力してください。',
  whitespace: '空白を指定できません。',
  duplicate: 'すでに登録されています。',
};

/**
 * エラーに入っている理由のコードを、画面に出す文言に変える。知らないコードは、そのまま返す。
 *
 * @param code エラーのメッセージ（理由のコード）
 */
export const toErrorMessage = (code: string | undefined) => {
  const result = RuleValueError.safeParse(code);
  return result.success ? ERROR_MESSAGES[result.data] : code;
};
