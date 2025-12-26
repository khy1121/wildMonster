
import React, { useState } from 'react';
import { GameState } from '../domain/types';
import { getTranslation } from '../localization/strings';
import { Modal } from './components/Modal';
import { Button } from './components/Button';
import { gameStateManager } from '../engine/GameStateManager';

interface MenuUIProps {
  state: GameState;
  onClose: () => void;
}

export const MenuUI: React.FC<MenuUIProps> = ({ state, onClose }) => {
  const t = getTranslation(state.language);
  const [confirmAction, setConfirmAction] = useState<'SAVE' | 'LOAD' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    const result = gameStateManager.manualSave();
    setConfirmAction(null);

    if (result.ok) {
      setMessage(t.ui.save_success);
      setTimeout(() => setMessage(null), 2000);
    } else {
      // Handle specific error cases
      let errorMessage = t.ui.save_failed;

      if ('reason' in result) {
        if (result.reason === 'quota_exceeded') {
          errorMessage = t.ui.quota_exceeded;
        } else if (result.reason === 'storage_unavailable') {
          errorMessage = t.ui.storage_unavailable;
        } else {
          errorMessage = `${t.ui.save_failed}: ${result.reason}`;
        }
      }

      setMessage(errorMessage);
      setTimeout(() => setMessage(null), 4000); // Longer for error messages
    }
  };

  const handleLoad = () => {
    const success = gameStateManager.manualLoad();
    if (success) {
      setMessage(t.ui.load_success);
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1500);
    } else {
      setMessage(t.ui.no_save);
    }
    setConfirmAction(null);
  };

  const toggleLanguage = () => {
    const nextLang = state.language === 'ko' ? 'en' : 'ko';
    gameStateManager.setLanguage(nextLang);
  };

  return (
    <Modal
      title={<span className="text-indigo-500">{t.ui.settings}</span>}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="p-6 space-y-6">
        {message && (
          <div className={`p-3 rounded-xl text-center font-bold animate-in fade-in slide-in-from-top-2 ${message.includes(t.ui.save_failed) || message.includes(t.ui.quota_exceeded) || message.includes(t.ui.storage_unavailable)
            ? 'bg-red-900/50 border border-red-500 text-red-200'
            : 'bg-indigo-900/50 border border-indigo-500 text-indigo-200'
            }`}>
            {message}
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="outline"
            size="full"
            onClick={() => toggleLanguage()}
            icon={<i className="fa-solid fa-globe"></i>}
          >
            {t.ui.language}: {state.language.toUpperCase()}
          </Button>

          <Button
            variant="primary"
            size="full"
            onClick={() => setConfirmAction('SAVE')}
            icon={<i className="fa-solid fa-floppy-disk"></i>}
          >
            {t.ui.save_game}
          </Button>

          <Button
            variant="secondary"
            size="full"
            disabled={!gameStateManager.hasSave()}
            onClick={() => setConfirmAction('LOAD')}
            icon={<i className="fa-solid fa-folder-open"></i>}
          >
            {t.ui.load_game}
          </Button>
        </div>

        {confirmAction && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl animate-in zoom-in-95">
            <p className="text-sm text-slate-300 mb-4 text-center">
              {confirmAction === 'SAVE' ? t.ui.confirm_save : t.ui.confirm_load}
            </p>
            <div className="flex gap-2">
              <Button
                variant={confirmAction === 'SAVE' ? 'primary' : 'danger'}
                size="full"
                onClick={confirmAction === 'SAVE' ? handleSave : handleLoad}
              >
                {t.ui.active}
              </Button>
              <Button variant="ghost" size="full" onClick={() => setConfirmAction(null)}>
                {t.ui.back}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800">
          <Button
            variant="danger"
            size="full"
            onClick={() => { if (window.confirm(t.ui.reset_progress)) { localStorage.clear(); window.location.reload(); } }}
          >
            {t.ui.reset_progress}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
