import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import './App.css';
import {
  Field,
  Fieldset,
  Label,
  Legend,
  Switch,
  Textarea,
} from '@headlessui/react';
import { CodeLabelWithButton } from './components/ui/CodeLabelWithButton';
import { Heading } from './components/ui/Heading';
import { HowToUse } from './components/ui/HowToUse';
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
      <Fieldset className="flex flex-col gap-x-3 px-3 pt-1 pb-3">
        <Legend>特殊文字のカウント設定</Legend>
        <Field>
          <Label> 空白をカウントしない </Label>
          <Switch
            checked={isIgnoreSpace}
            onChange={setIsIgnoreSpace}
            name="terms-of-service"
            className="group inline-flex h-6 w-11 items-center rounded-full bg-neutral-600 transition data-checked:bg-teal-600"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
          </Switch>
        </Field>
        <Field>
          <Label> 改行をカウントしない </Label>
          <Switch
            checked={isIgnoreLineBreak}
            onChange={setIsIgnoreLineBreak}
            name="terms-of-service"
            className="group inline-flex h-6 w-11 items-center rounded-full bg-neutral-600 transition data-checked:bg-teal-600"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
          </Switch>
        </Field>
      </Fieldset>
      <Fieldset className="px-3 pt-1 pb-3">
        <Legend>カウントしない文字</Legend>
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
      </Fieldset>
      <Fieldset className="px-3 pt-1 pb-3">
        <Legend>カウントしない行</Legend>
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
      </Fieldset>
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
