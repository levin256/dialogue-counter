/**
 * 等幅フォントで表示したときの幅を、半角1文字を 1 として数える（全角は 2）。
 * 半角として数えるのは、ASCII の表示できる文字と、半角カタカナだけ。それ以外は全角として数える。
 *
 * @example
 * displayWidth('//') // => 2
 * displayWidth('※注') // => 4
 */
export const displayWidth = (text: string) =>
  [...text].reduce((width, char) => width + (isHalfWidth(char) ? 1 : 2), 0);

const isHalfWidth = (char: string) => {
  const code = char.codePointAt(0) ?? 0;
  return (
    (code >= 0x20 && code <= 0x7e) || // ASCII の表示できる文字
    (code >= 0xff61 && code <= 0xff9f) // 半角カタカナ
  );
};
