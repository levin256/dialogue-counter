import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import './App.css';
import { Field, Textarea } from '@headlessui/react';
import { HowToUse } from './HowToUse';
import { CodeLabelWithButton } from './components/ui/CodeLabelWithButton';
import { IgnoreLinePrefixForm } from './features/dialogueCounter/IgnoreLinePrefixForm';
import { IgnoreStringForm } from './features/dialogueCounter/IgnoreStringForm';
import { useIgnoreLinePrefixStore } from './stores/ignoreLinePrefixes';
import { useIgnoreStringStore } from './stores/ignoreStrings';
import { excludeIgnoreString } from './utils/string';
import { useWarnIfUnsavedChanges } from './utils/useWarnIfUnsavedChanges';

const App = () => {
  const { ignoreStrings, removeIgnoreString } = useIgnoreStringStore();
  const { ignoreLinePrefixes, removeIgnoreLinePrefix } =
    useIgnoreLinePrefixStore();

  const [isIgnoreSpace, setIsIgnoreSpace] = useState<boolean>(false);
  const [isIgnoreLineBreak, setIsIgnoreLineBreak] = useState<boolean>(false);
  const [text, setText] = useState('');
  const [textCount, setTextCount] = useState(
    excludeIgnoreString(
      text,
      ignoreStrings,
      ignoreLinePrefixes,
      isIgnoreSpace,
      isIgnoreLineBreak,
    ).length,
  );

  useEffect(() => {
    setTextCount(
      excludeIgnoreString(
        text,
        ignoreStrings,
        ignoreLinePrefixes,
        isIgnoreSpace,
        isIgnoreLineBreak,
      ).length,
    );
  }, [
    text,
    isIgnoreSpace,
    isIgnoreLineBreak,
    ignoreStrings,
    ignoreLinePrefixes,
  ]);

  useWarnIfUnsavedChanges(text.length > 0);

  return (
    <div className="flex flex-col justify-start gap-y-3 p-4">
      <h1>台詞カウンター</h1>
      <HowToUse />
      <fieldset className="flex gap-x-3 px-3 pt-1 pb-3">
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
      <fieldset className="px-3 pt-1 pb-3">
        <legend>カウントしない文字</legend>
        <ul className="flex flex-col gap-y-2">
          {ignoreStrings.map(({ id, ignoreString }) => (
            <li key={id} className="flex w-60">
              <CodeLabelWithButton
                codeLabelProps={{ label: ignoreString }}
                buttonProps={{
                  icon: faTrash,
                  onClick: () => removeIgnoreString(id),
                  isDanger: true,
                  className: 'rounded-e-md',
                }}
              />
            </li>
          ))}
        </ul>
        <IgnoreStringForm />
      </fieldset>
      <fieldset className="px-3 pt-1 pb-3">
        <legend>カウントしない行</legend>
        <ul className="flex flex-col gap-y-2">
          {ignoreLinePrefixes.map(({ id, ignoreLinePrefix }) => (
            <li key={id} className="flex w-60">
              <CodeLabelWithButton
                codeLabelProps={{ label: ignoreLinePrefix }}
                buttonProps={{
                  icon: faTrash,
                  onClick: () => removeIgnoreLinePrefix(id),
                  isDanger: true,
                  className: 'rounded-e-md',
                }}
              />
            </li>
          ))}
        </ul>
        <IgnoreLinePrefixForm />
      </fieldset>
      <Field className="flex flex-col">
        <h3>テキスト（文字数: {textCount}）</h3>
        <Textarea
          className="h-[32rem] rounded-md border-none bg-neutral-600 p-3 outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text."
        />
      </Field>
    </div>
  );
};

export default App;
