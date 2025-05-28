import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import './App.css';
import { Field, Label, Textarea } from '@headlessui/react';
import { CodeLabelWithButton } from './components/ui/CodeLabelWithButton';
import { FieldsetGroup } from './components/ui/FieldsetGroup';
import { Heading } from './components/ui/Heading';
import { HowToUse } from './components/ui/HowToUse';
import { Toggle } from './components/ui/Toggle';
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
      <Heading level={1}>台詞カウンター</Heading>
      <HowToUse />
      <FieldsetGroup
        legend="特殊文字のカウント設定"
        className="flex flex-col gap-x-3"
      >
        <Field>
          <Label> 空白をカウントしない </Label>
          <Toggle checked={isIgnoreSpace} onChange={setIsIgnoreSpace} />
        </Field>
        <Field>
          <Label> 改行をカウントしない </Label>
          <Toggle checked={isIgnoreLineBreak} onChange={setIsIgnoreLineBreak} />
        </Field>
      </FieldsetGroup>
      <FieldsetGroup legend="カウントしない文字">
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
      </FieldsetGroup>
      <FieldsetGroup legend="カウントしない行">
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
      </FieldsetGroup>
      <Field className="flex flex-col">
        <Heading level={3}>テキスト（文字数: {textCount}）</Heading>
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
