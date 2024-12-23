import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { webcontainerContext } from '~/lib/webcontainer';
import { classNames } from '~/utils/classNames';
import { exportFiles } from '~/utils/export';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

interface HeaderActionButtonsProps {}

export function HeaderActionButtons({}: HeaderActionButtonsProps) {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const { showChat } = useStore(chatStore);
  const [isExporting, setIsExporting] = useState(false);
  const [isWebContainerReady, setIsWebContainerReady] = useState(false);

  useEffect(() => {
    // Check if WebContainer is ready
    setIsWebContainerReady(webcontainerContext.loaded);
  }, []);

  const canHideChat = showWorkbench || !showChat;

  const handleExport = async () => {
    if (isExporting || !isWebContainerReady) return;
    
    setIsExporting(true);
    try {
      await exportFiles();
      toast.success('Project files exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export project files. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex">
      <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden">
        <Button
          active={showChat}
          disabled={!canHideChat}
          onClick={() => {
            if (canHideChat) {
              chatStore.setKey('showChat', !showChat);
            }
          }}
        >
          <div className="i-bolt:chat text-sm" />
        </Button>
        <div className="w-[1px] bg-bolt-elements-borderColor" />
        <Button
          active={showWorkbench}
          onClick={() => {
            if (showWorkbench && !showChat) {
              chatStore.setKey('showChat', true);
            }

            workbenchStore.showWorkbench.set(!showWorkbench);
          }}
        >
          <div className="i-ph:code-bold" />
        </Button>
        <div className="w-[1px] bg-bolt-elements-borderColor" />
        <Button
          onClick={handleExport}
          disabled={isExporting || !isWebContainerReady}
          title={!isWebContainerReady ? 'Waiting for WebContainer to load...' : 'Export project files'}
        >
          <div className={isExporting ? "i-svg-spinners:180-ring-with-bg" : "i-ph:download-bold"} />
        </Button>
      </div>
    </div>
  );
}

interface ButtonProps {
  active?: boolean;
  disabled?: boolean;
  children?: any;
  onClick?: VoidFunction;
  title?: string;
}

function Button({ active = false, disabled = false, children, onClick, title }: ButtonProps) {
  return (
    <button
      className={classNames('flex items-center p-1.5', {
        'bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary':
          !active && !disabled,
        'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent': active && !disabled,
        'bg-bolt-elements-item-backgroundDefault text-alpha-gray-20 dark:text-alpha-white-20 cursor-not-allowed':
          disabled,
      })}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
