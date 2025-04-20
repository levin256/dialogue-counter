import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { HowToUse } from './HowToUse';
import type { IgnoreLinePrefix, IgnoreString } from './schemas';
import { escapeRegExp } from './utils/string';

const App = () => {
  const excludeInogreString = (text: string) => {
    const textWithoutIgnoreLine = ignoreLinePrefixes.reduce(
      (currentText, { ignoreLinePrefix }) => {
        const lines = currentText.split(/\n/);
        return lines
          .filter((line) => !line.startsWith(ignoreLinePrefix))
          .join('\n');
      },
      text,
    );

    const currentIgnoreStrings = [
      ...ignoreStrings.map(({ ignoreString }) => ignoreString),
    ];
    if (isIgnoreSpace) {
      currentIgnoreStrings.push(' ');
      currentIgnoreStrings.push('\u3000');
    }
    if (isIgnoreLineBreak) {
      currentIgnoreStrings.push('\n');
    }
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

  const ignoreStringRef = useRef<HTMLInputElement>(null!);
  const ignoreLinePrefixRef = useRef<HTMLInputElement>(null!);
  const [isIgnoreSpace, setIsIgnoreSpace] = useState<boolean>(false);
  const [isIgnoreLineBreak, setIsIgnoreLineBreak] = useState<boolean>(false);
  const [ignoreStrings, setIgnoreStrings] = useState<IgnoreString[]>(
    ['、', '。', '「', '」', '…', '！', '？'].map((ignoreString) => ({
      id: uuidv4(),
      ignoreString,
    })),
  );
  const [ignoreLinePrefixes, setIgnoreLinePrefixes] = useState<
    IgnoreLinePrefix[]
  >(['//'].map((ignoreLinePrefix) => ({ id: uuidv4(), ignoreLinePrefix })));
  const [text, setText] = useState('');
  const [textCount, setTextCount] = useState(excludeInogreString(text).length);

  useEffect(() => {
    const ignoreStringsJson = localStorage.getItem('ignoreStrings');
    if (ignoreStringsJson) {
      setIgnoreStrings(JSON.parse(ignoreStringsJson));
    }

    const ignoreLinePrefixesJson = localStorage.getItem('ignoreLinePrefixes');
    if (ignoreLinePrefixesJson) {
      setIgnoreLinePrefixes(JSON.parse(ignoreLinePrefixesJson));
    }

    const handleBeforeUnload = (event: Event) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    setTextCount(excludeInogreString(text).length);
  }, [
    text,
    isIgnoreSpace,
    isIgnoreLineBreak,
    ignoreStrings,
    ignoreLinePrefixes,
  ]);

  const isValidInput = (string: string) => {
    if (!string) {
      alert('文字を入力してください');
      return false;
    }
    // TODO: なぜか機能しない
    if (['\n'].includes(string)) {
      alert('改行を指定できません。');
      return false;
    }
    if (string.match(/^(\s|u3000)+$/)) {
      alert('空白を指定できません。');
      return false;
    }
    return true;
  };

  const addIgnoreString = () => {
    const inputIgnoreString = ignoreStringRef.current?.value;
    if (!isValidInput(inputIgnoreString)) return;

    const newIgnoreStrings = [
      ...ignoreStrings,
      { id: uuidv4(), ignoreString: inputIgnoreString },
    ];
    setIgnoreStrings(newIgnoreStrings);
    localStorage.setItem('ignoreStrings', JSON.stringify(newIgnoreStrings));
    ignoreStringRef.current.value = '';
  };

  const addIgnoreLinePrefix = () => {
    const inputIgnoreLinePrefix = ignoreLinePrefixRef.current.value;
    if (!isValidInput(inputIgnoreLinePrefix)) return;

    const newIgnoreLinePrefixes = [
      ...ignoreLinePrefixes,
      { id: uuidv4(), ignoreLinePrefix: inputIgnoreLinePrefix },
    ];
    setIgnoreLinePrefixes(newIgnoreLinePrefixes);
    localStorage.setItem(
      'ignoreLinePrefixes',
      JSON.stringify(newIgnoreLinePrefixes),
    );
    ignoreLinePrefixRef.current.value = '';
  };

  const deleteIgnoreString = (deleteIgnoreStringId: string) => {
    const afterDeleteIgnoreStrings = ignoreStrings.filter(
      ({ id }) => id !== deleteIgnoreStringId,
    );
    setIgnoreStrings(afterDeleteIgnoreStrings);
    localStorage.setItem(
      'ignoreStrings',
      JSON.stringify(afterDeleteIgnoreStrings),
    );
  };

  const deleteIgnoreLinePrefix = (deleteIgnoreLinePrefixId: string) => {
    const afterDeleteIgnoreLinePrefixes = ignoreLinePrefixes.filter(
      ({ id }) => id !== deleteIgnoreLinePrefixId,
    );
    setIgnoreLinePrefixes(afterDeleteIgnoreLinePrefixes);
    localStorage.setItem(
      'ignoreLinePrefixes',
      JSON.stringify(afterDeleteIgnoreLinePrefixes),
    );
  };

  return (
    <div className="gap05rem flex-column">
      <h1>台詞カウンター</h1>
      <HowToUse />
      <fieldset className="display-flex gap1rem">
        <legend>特殊文字のカウント設定</legend>
        <label>
          <input
            type="checkbox"
            checked={isIgnoreSpace}
            onChange={(event) => setIsIgnoreSpace(event.target.checked)}
          />
          空白をカウントしない
        </label>
        <label>
          <input
            type="checkbox"
            checked={isIgnoreLineBreak}
            onChange={(event) => setIsIgnoreLineBreak(event.target.checked)}
          />
          改行をカウントしない
        </label>
      </fieldset>
      <fieldset>
        <legend>カウントしない文字</legend>
        <ul>
          {ignoreStrings.map(({ id, ignoreString }) => (
            <li key={id}>
              <div className="display-flex padding-block">
                <code className="code-label">{ignoreString}</code>
                <button
                  type="button"
                  className="trash-btn"
                  onClick={() => deleteIgnoreString(id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="btn-container">
          <input
            type="text"
            placeholder="Enter ignore string."
            ref={ignoreStringRef}
          />
          <button type="button" onClick={addIgnoreString}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </fieldset>
      <fieldset>
        <legend>カウントしない行</legend>
        <ul>
          {ignoreLinePrefixes.map(({ id, ignoreLinePrefix }) => (
            <li key={id}>
              <div className="display-flex padding-block">
                <code className="code-label">{ignoreLinePrefix}</code>
                <button
                  type="button"
                  className="trash-btn"
                  onClick={() => deleteIgnoreLinePrefix(id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="btn-container">
          <input
            type="text"
            placeholder="Enter ignore line."
            ref={ignoreLinePrefixRef}
          />
          <button
            type="button"
            className="add-btn"
            onClick={addIgnoreLinePrefix}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </fieldset>
      <div className="flex-column">
        <h3>テキスト（文字数: {textCount}）</h3>
        <textarea
          className="radius-6p height-500 flex-column"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text."
        />
      </div>
    </div>
  );
};

export default App;
