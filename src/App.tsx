import { faQuestionCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
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
import { Divider } from './components/ui/Divider';
import { FieldsetGroup } from './components/ui/FieldsetGroup';
import { Heading } from './components/ui/Heading';
import { Toggle } from './components/ui/Toggle';
import HowToUseDialog from './features/counter/components/HowToUseDialog';
import { RuleValueForm } from './features/counter/components/RuleValueForm';
import { countText } from './features/counter/domain/countRule';
import { useCountRuleStore } from './features/counter/stores/countRule';
import { useHowToUseStore } from './features/counter/stores/howToUse';
import { useWarnIfUnsavedChanges } from './hooks/useWarnIfUnsavedChanges';

const App = () => {
  const { hasSeen, markAsSeen } = useHowToUseStore();
  // 自動で開くのは、まだ一度も閉じていないときだけ
  const [isOpen, setIsOpen] = useState(!hasSeen);
  const closeHowToUse = () => {
    setIsOpen(false);
    markAsSeen();
  };
  const countRule = useCountRuleStore();
  const {
    ignoreStrings,
    ignoreLinePrefixes,
    ignoreSpace,
    ignoreLineBreak,
    addIgnoreString,
    removeIgnoreString,
    addIgnoreLinePrefix,
    removeIgnoreLinePrefix,
    setIgnoreSpace,
    setIgnoreLineBreak,
  } = countRule;

  const [text, setText] = useState('');
  // 他の値から計算できるので state にせず、レンダーのたびに計算する
  const textCount = countText(text, countRule);

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
              widthAuto
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
            <Toggle checked={ignoreSpace} onChange={setIgnoreSpace} />
          </Field>
          <Field className="flex items-center gap-x-3">
            <Label> 改行をカウントしない </Label>
            <Toggle checked={ignoreLineBreak} onChange={setIgnoreLineBreak} />
          </Field>
        </FieldsetGroup>

        <Divider />

        <FieldsetGroup
          legend="カウントしない文字"
          className="flex flex-col gap-y-2"
          legendClassName="text-base font-semibold"
        >
          <ul className="flex flex-col gap-y-2">
            {ignoreStrings.map((ignoreString) => (
              <li key={ignoreString}>
                <CodeLabelWithButton
                  className="flex w-60"
                  codeLabelProps={{ label: ignoreString }}
                  buttonProps={{
                    icon: faTrash,
                    onClick: () => removeIgnoreString(ignoreString),
                    isDanger: true,
                  }}
                />
              </li>
            ))}
          </ul>
          <RuleValueForm registered={ignoreStrings} onAdd={addIgnoreString} />
        </FieldsetGroup>

        <Divider />

        <FieldsetGroup
          legend="カウントしない行の先頭文字"
          className="flex flex-col gap-y-2"
          legendClassName="text-base font-semibold"
        >
          <p className="text-sm text-white/65">
            行頭のスペースやタブは無視して判定します（例:
            <code className="whitespace-pre">{'「  // メモ」'}</code>
            も対象）
          </p>
          <ul className="flex flex-col gap-y-2">
            {ignoreLinePrefixes.map((ignoreLinePrefix) => (
              <li key={ignoreLinePrefix}>
                <CodeLabelWithButton
                  className="flex w-60"
                  codeLabelProps={{ label: ignoreLinePrefix }}
                  buttonProps={{
                    icon: faTrash,
                    onClick: () => removeIgnoreLinePrefix(ignoreLinePrefix),
                    isDanger: true,
                  }}
                />
              </li>
            ))}
          </ul>
          <RuleValueForm
            registered={ignoreLinePrefixes}
            onAdd={addIgnoreLinePrefix}
          />
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
      <HowToUseDialog isOpen={isOpen} onClose={closeHowToUse} />
    </div>
  );
};

export default App;
