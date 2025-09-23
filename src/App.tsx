import { faQuestionCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Field,
  Fieldset,
  Label,
  Legend,
  Textarea,
} from '@headlessui/react';
import { CodeLabelWithButton } from './components/ui/CodeLabelWithButton';
import { FieldsetGroup } from './components/ui/FieldsetGroup';
import { Heading } from './components/ui/Heading';
import HowToUseDialog from './components/ui/HowToUseDialog';
import { Toggle } from './components/ui/Toggle';
import { IgnoreLinePrefixForm } from './features/dialogueCounter/IgnoreLinePrefixForm';
import { IgnoreStringForm } from './features/dialogueCounter/IgnoreStringForm';
import { useIgnoreLinePrefixStore } from './stores/ignoreLinePrefixes';
import { useIgnoreStringStore } from './stores/ignoreStrings';
import { excludeIgnoreString } from './utils/string';
import { useWarnIfUnsavedChanges } from './utils/useWarnIfUnsavedChanges';

const App = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { ignoreStrings, removeIgnoreString } = useIgnoreStringStore();
  const { ignoreLinePrefixes, removeIgnoreLinePrefix } =
    useIgnoreLinePrefixStore();

  const [isIgnoreSpace, setIsIgnoreSpace] = useState<boolean>(true);
  const [isIgnoreLineBreak, setIsIgnoreLineBreak] = useState<boolean>(true);
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
    <div className="flex flex-col justify-start gap-y-3 p-4 pb-36">
      <Heading level={1}>台詞カウンター</Heading>

      <Fieldset className="flex flex-col gap-4 space-y-2 rounded-xl bg-white/6 p-5">
        <div className="group flex flex-row gap-3">
          <Legend className="font-semibold text-xl">設定</Legend>
          <Button onClick={() => setIsOpen(true)}>
            <FontAwesomeIcon
              icon={faQuestionCircle}
              className="text-md text-teal-600"
            />
          </Button>
        </div>

        <FieldsetGroup
          legend="特殊文字のカウント設定"
          className="flex flex-col gap-y-1.5"
          legendClassName="text-base font-semibold"
        >
          <Field className="flex items-center gap-x-3">
            <Label> 空白をカウントしない </Label>
            <Toggle checked={isIgnoreSpace} onChange={setIsIgnoreSpace} />
          </Field>
          <Field className="flex items-center gap-x-3">
            <Label> 改行をカウントしない </Label>
            <Toggle
              checked={isIgnoreLineBreak}
              onChange={setIsIgnoreLineBreak}
            />
          </Field>
        </FieldsetGroup>

        <FieldsetGroup
          legend="カウントしない文字"
          className="flex flex-col gap-y-2"
          legendClassName="text-base font-semibold"
        >
          <ul className="flex flex-col gap-y-2">
            {ignoreStrings.map(({ id, ignoreString }) => (
              <li key={id}>
                <CodeLabelWithButton
                  className="flex w-60"
                  codeLabelProps={{ label: ignoreString }}
                  buttonProps={{
                    icon: faTrash,
                    onClick: () => removeIgnoreString(id),
                    isDanger: true,
                  }}
                />
              </li>
            ))}
          </ul>
          <IgnoreStringForm />
        </FieldsetGroup>

        <FieldsetGroup
          legend="カウントしない行の先頭文字"
          className="flex flex-col gap-y-2"
          legendClassName="text-base font-semibold"
        >
          <ul className="flex flex-col gap-y-2">
            {ignoreLinePrefixes.map(({ id, ignoreLinePrefix }) => (
              <li key={id}>
                <CodeLabelWithButton
                  className="flex w-60"
                  codeLabelProps={{ label: ignoreLinePrefix }}
                  buttonProps={{
                    icon: faTrash,
                    onClick: () => removeIgnoreLinePrefix(id),
                    isDanger: true,
                  }}
                />
              </li>
            ))}
          </ul>
          <IgnoreLinePrefixForm />
        </FieldsetGroup>
      </Fieldset>

      <FieldsetGroup
        legend="テキスト"
        className="flex flex-col gap-1.5 space-y-2 rounded-xl bg-white/6 p-5"
        legendClassName="font-semibold text-xl"
      >
        <Heading level={6}>文字数 : {textCount}</Heading>
        <Field className="flex flex-col">
          <Textarea
            className="h-[64rem] rounded-md border-none bg-neutral-600 p-3 outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="カウントしたい文字を入力してください"
          />
        </Field>
      </FieldsetGroup>
      <HowToUseDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default App;
