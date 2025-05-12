import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { HowToUse } from './HowToUse';
import { IgnoreStringForm } from './features/dialogueCounter/ignoreStringForm';
import { validateIgnoreLinePrefix } from './schemas';
import { useIgnoreLinePrefixStore } from './stores/ignoreLinePrefixes';
import { useIgnoreStringStore } from './stores/ignoreStrings';
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

  const [ignoreLinePrefix, setIgnoreLinePrefix] = useState<string>('');
  const [isIgnoreSpace, setIsIgnoreSpace] = useState<boolean>(false);
  const [isIgnoreLineBreak, setIsIgnoreLineBreak] = useState<boolean>(false);
  const { ignoreStrings, removeIgnoreString } = useIgnoreStringStore();
  const { ignoreLinePrefixes, addIgnoreLinePrefix, removeIgnoreLinePrefix } =
    useIgnoreLinePrefixStore();
  const [text, setText] = useState('');
  const [textCount, setTextCount] = useState(excludeInogreString(text).length);

  useEffect(() => {
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

  const _addIgnoreLinePrefix = () => {
    const inputIgnoreLinePrefix = {
      id: uuidv4(),
      ignoreLinePrefix,
    };
    const result = validateIgnoreLinePrefix(inputIgnoreLinePrefix);
    if (!result.success) {
      alert(result.messages);
      return;
    }
    addIgnoreLinePrefix(ignoreLinePrefix);
    setIgnoreLinePrefix('');
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
                  onClick={() => removeIgnoreString(id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <IgnoreStringForm />
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
                  onClick={() => removeIgnoreLinePrefix(id)}
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
            value={ignoreLinePrefix}
            onChange={(e) => setIgnoreLinePrefix(e.target.value)}
          />
          <button
            type="button"
            className="add-btn"
            onClick={_addIgnoreLinePrefix}
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
