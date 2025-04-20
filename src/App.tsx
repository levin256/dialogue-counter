import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { HowToUse } from './HowToUse';
import { escapeRegExp } from './utils/string';

const App = () => {
  const excludeInogreString = (text: string) => {
    const textWithoutIgnoreLine = ignoreLines.reduce(
      (currentText, ignoreLine) => {
        const lines = currentText.split(/\n/);
        return lines.filter((line) => !line.startsWith(ignoreLine)).join('\n');
      },
      text,
    );

    const currentIgnoreStrings = [...ignoreStrings];
    if (isIgnoreSpace) {
      currentIgnoreStrings.push(' ');
      currentIgnoreStrings.push('　');
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

  const ignoreStringRef = useRef<HTMLInputElement>(null);
  const ignoreLineRef = useRef<HTMLInputElement>(null);
  const [isIgnoreSpace, setIsIgnoreSpace] = useState<boolean>(false);
  const [isIgnoreLineBreak, setIsIgnoreLineBreak] = useState<boolean>(false);
  const [ignoreStrings, setIgnoreStrings] = useState<string[]>([
    '、',
    '。',
    '「',
    '」',
    '…',
    '！',
    '？',
  ]);
  const [ignoreLines, setIgnoreLines] = useState<string[]>(['//']);
  const [text, setText] = useState('');
  const [textCount, setTextCount] = useState(excludeInogreString(text).length);

  useEffect(() => {
    const lsIgnoreStrings = localStorage.getItem('ignoreStrings');
    if (lsIgnoreStrings) {
      setIgnoreStrings(JSON.parse(lsIgnoreStrings));
    }

    const lsIgnoreLines = localStorage.getItem('ignoreLines');
    if (lsIgnoreLines) {
      setIgnoreLines(JSON.parse(lsIgnoreLines));
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
  }, [text, isIgnoreSpace, isIgnoreLineBreak, ignoreStrings, ignoreLines]);

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

    const newIgnoreStrings = [...ignoreStrings, inputIgnoreString];
    setIgnoreStrings(newIgnoreStrings);
    localStorage.setItem('ignoreStrings', JSON.stringify(newIgnoreStrings));
    ignoreStringRef.current.value = '';
  };

  const addIgnoreLine = () => {
    const inputIgnoreLine = ignoreLineRef.current.value;
    if (!isValidInput(inputIgnoreLine)) return;

    const newIgnoreLines = [...ignoreLines, inputIgnoreLine];
    setIgnoreLines(newIgnoreLines);
    localStorage.setItem('ignoreLines', JSON.stringify(newIgnoreLines));
    ignoreLineRef.current.value = '';
  };

  const deleteIgnoreString = (deleteKeyIndex: number) => {
    const afterDeleteignoreStrings = ignoreStrings.filter(
      (_, index) => index !== deleteKeyIndex,
    );
    setIgnoreStrings(afterDeleteignoreStrings);
    localStorage.setItem(
      'ignoreStrings',
      JSON.stringify(afterDeleteignoreStrings),
    );
  };

  const deleteIgnoreLine = (deleteKeyIndex: number) => {
    const afterDeleteignoreLines = ignoreLines.filter(
      (_, index) => index !== deleteKeyIndex,
    );
    setIgnoreLines(afterDeleteignoreLines);
    localStorage.setItem('ignoreLines', JSON.stringify(afterDeleteignoreLines));
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
          {ignoreStrings.map((ignoreString, index) => (
            <li key={index}>
              <div className="display-flex padding-block">
                <code className="code-label">{ignoreString}</code>
                <button
                  type="button"
                  className="trash-btn"
                  onClick={() => deleteIgnoreString(index)}
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
          {ignoreLines.map((ignoreLine, index) => (
            <li key={index}>
              <div className="display-flex padding-block">
                <code className="code-label">{ignoreLine}</code>
                <button
                  type="button"
                  className="trash-btn"
                  onClick={() => deleteIgnoreLine(index)}
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
            ref={ignoreLineRef}
          />
          <button type="button" className="add-btn" onClick={addIgnoreLine}>
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
