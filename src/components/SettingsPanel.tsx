import React from 'react';
import { AgentSettings, ThemeMode } from '../types';
import { ShieldCheck, Key, CheckCircle2, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { playTactileSound } from '../utils/sound';

interface SettingsPanelProps {
  settings: AgentSettings;
  onSaveSettings: (settings: AgentSettings) => void;
  theme?: ThemeMode;
  soundFxEnabled?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSaveSettings,
  soundFxEnabled = true,
}) => {
  const [localSettings, setLocalSettings] = React.useState<AgentSettings>(settings);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSave = () => {
    playTactileSound('primary', soundFxEnabled);
    onSaveSettings(localSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agent_settings', JSON.stringify(localSettings));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-6 shadow-2xl">
        <div className="flex items-center space-x-3 border-b border-[#1a1a1a] pb-4">
          <div className="p-2.5 rounded-lg bg-[#0c0c0c] border border-white/10 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif italic text-white">Guardrails & Budget Controls</h2>
            <p className="text-xs text-[#a1a1aa] font-sans">
              Configure maximum attempt retries, file modification limits, and real GitHub PAT credentials.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Execution Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-[#080808] p-4 rounded-lg border border-[#1a1a1a]">
              <label className="text-xs font-mono font-bold text-white flex items-center justify-between">
                <span>Max Execution Retry Loops</span>
                <span className="text-amber-400 font-mono text-xs">{localSettings.maxAttempts} attempts</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={localSettings.maxAttempts}
                onChange={(e) => {
                  playTactileSound('click', soundFxEnabled);
                  setLocalSettings({ ...localSettings, maxAttempts: Number(e.target.value) });
                }}
                className="w-full accent-[#4ade80]"
              />
              <p className="text-[11px] text-[#a1a1aa] font-sans">
                Prevents infinite retry loops in the sandbox if tests fail repeatedly.
              </p>
            </div>

            <div className="space-y-2 bg-[#080808] p-4 rounded-lg border border-[#1a1a1a]">
              <label className="text-xs font-mono font-bold text-white flex items-center justify-between">
                <span>Max Modified Files per PR</span>
                <span className="text-amber-400 font-mono text-xs">{localSettings.maxFilesModified} file limit</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={localSettings.maxFilesModified}
                onChange={(e) => {
                  playTactileSound('click', soundFxEnabled);
                  setLocalSettings({ ...localSettings, maxFilesModified: Number(e.target.value) });
                }}
                className="w-full accent-[#4ade80]"
              />
              <p className="text-[11px] text-[#a1a1aa] font-sans">
                Ensures agent hotfixes remain tightly scoped to pinpointed failing code.
              </p>
            </div>
          </div>

          {/* Policy Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.label
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-start space-x-3 p-4 bg-[#080808] rounded-lg border border-[#1a1a1a] cursor-pointer hover:border-white/20 transition-colors"
            >
              <input
                type="checkbox"
                checked={localSettings.onlyDeterministicTests}
                onChange={(e) => {
                  playTactileSound('toggle', soundFxEnabled);
                  setLocalSettings({ ...localSettings, onlyDeterministicTests: e.target.checked });
                }}
                className="mt-1 accent-[#4ade80] rounded w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-white block font-sans">Deterministic Tests Only</span>
                <span className="text-[11px] text-[#a1a1aa] block mt-0.5 font-sans">
                  Ignores flaky external integrations or network timeouts to prevent false fixes.
                </span>
              </div>
            </motion.label>

            <motion.label
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-start space-x-3 p-4 bg-[#080808] rounded-lg border border-[#1a1a1a] cursor-pointer hover:border-white/20 transition-colors"
            >
              <input
                type="checkbox"
                checked={localSettings.autoCommitAndPush}
                onChange={(e) => {
                  playTactileSound('toggle', soundFxEnabled);
                  setLocalSettings({ ...localSettings, autoCommitAndPush: e.target.checked });
                }}
                className="mt-1 accent-[#4ade80] rounded w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-white block font-sans">Auto-Push Hotfix to Branch</span>
                <span className="text-[11px] text-[#a1a1aa] block mt-0.5 font-sans">
                  Pushes green commits directly to GitHub without requiring manual approval click.
                </span>
              </div>
            </motion.label>
          </div>

          {/* GitHub Credentials */}
          <div className="bg-[#080808] p-5 rounded-lg border border-[#1a1a1a] space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#1a1a1a] pb-2">
              <Key className="w-4 h-4 text-[#4ade80]" />
              <h3 className="font-serif italic text-sm text-white">GitHub Personal Access Token (PAT) Integration</h3>
            </div>

            <p className="text-xs text-[#a1a1aa] font-sans">
              Provide a GitHub PAT with <code className="text-[#dcdcdc] font-mono">repo</code> scope to allow the agent to push live commits and post comments to your actual GitHub PRs.
            </p>

            <div className="space-y-1">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={localSettings.githubToken || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, githubToken: e.target.value })}
                className="w-full bg-[#050505] border border-[#1a1a1a] rounded px-3 py-2 text-xs text-[#dcdcdc] font-mono focus:outline-none focus:border-[#4ade80]"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs text-[#4ade80] font-mono font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Guardrails and settings saved successfully!
              </span>
            ) : (
              <span className="text-xs text-[#a1a1aa] font-mono">
                Settings are persisted in your local session storage.
              </span>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSave}
              className="px-5 py-2 bg-[#4ade80] hover:bg-[#3ecf73] text-black font-bold rounded-md shadow-md text-xs font-mono uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Guardrails</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
