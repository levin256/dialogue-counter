import { useEffect } from 'react';

/**
 * 保存していない入力があるあいだ、ページを閉じる・再読み込みするときに、ブラウザの確認を出す。
 *
 * @param hasUnsavedChanges 失うと困る入力があるか
 */
export const useWarnIfUnsavedChanges = (hasUnsavedChanges: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
};
