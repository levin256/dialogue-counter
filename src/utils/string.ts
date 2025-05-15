import type { IgnoreLinePrefix, IgnoreString } from '../schemas';

export const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const onlyWhiteSpaceRegex = /^(\s|u3000)+$/;

export const excludeIgnoreString = (
  text: string,
  ignoreStrings: IgnoreString[],
  ignoreLinePrefixes: IgnoreLinePrefix[],
  isIgnoreSpace: boolean,
  isIgnoreLineBreak: boolean,
) => {
  const currentIgnoreStrings = [
    ...ignoreStrings.map(({ ignoreString }) => ignoreString),
    ...(isIgnoreSpace ? [' ', '\u3000'] : []),
    ...(isIgnoreLineBreak ? ['\n'] : []),
  ];

  const textWithoutIgnoreLine = ignoreLinePrefixes.reduce(
    (currentText, { ignoreLinePrefix }) => {
      const lines = currentText.split(/\n/);
      return lines
        .filter((line) => !line.startsWith(ignoreLinePrefix))
        .join('\n');
    },
    text,
  );
  const textWithoutIgnoreString = currentIgnoreStrings.reduce(
    (currentText, string) => {
      const escapeString = escapeRegExp(string);
      const regex = new RegExp(escapeString, 'g');
      return currentText.replaceAll(regex, '');
    },
    textWithoutIgnoreLine,
  );
  return textWithoutIgnoreString;
};
