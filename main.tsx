import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Activity, Radio, ShieldCheck, Cpu } from 'lucide-react';

type TabType = 'simulator' | 'status' | 'webhooks' | 'settings' | 'architecture';

interface TabTransitionWrapperProps {
  activeTab: TabType;
  children: React.ReactNode;
}

const TAB_META: Record<TabType, { name: string; category: string; icon: React.ReactNode; color: string; desc: string }> = {
  simulator: {
    name: 'PR Simulator & E2B Sandbox',
    category: 'Main Stage',
    icon: <Terminal className="w-5 h-5 text-[#4ade80]" />,
    color: '#4ade80',
    desc: 'Autonomous hotfix reproduction, Gemini AI code synthesis & test runner.',
  },
  status: {
    name: 'Real-Time PR Build Monitor',
    category: 'Pipeline Feed',
    icon: <Activity className="w-5 h-5 text-amber-400" />,
    color: '#fbbf24',
    desc: 'Live build monitoring across active pull request pipelines.',
  },
  webhooks: {
    name: 'Webhook Payload Inspector',
    category: 'Telemetry',
    icon: <Radio className="w-5 h-5 text-cyan-400" />,
    color: '#38bdf8',
    desc: 'Raw GitHub event delivery logs & endpoint payload debugging.',
  },
  settings: {
    name: 'Guardrails & Budget Controls',
    category: 'Configuration',
    icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
    color: '#c084fc',
    desc: 'Execution attempt limits, modification safety thresholds & PAT keys.',
  },
  architecture: {
    name: 'Production Architecture Guide',
    category: 'Infrastructure',
    icon: <Cpu className="w-5 h-5 text-emerald-400" />,
    color: '#34d399',
    desc: 'Serverless Cloud Run containers, E2B SDK & event-driven specs.',
  },
};

export const TabTransitionWrapper: React.FC<TabTransitionWrapperProps> = ({ activeTab, children }) => {
  const currentMeta = TAB_META[activeTab] || TAB_META.simulator;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.985 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative"
        >
          {/* Subtle Top Cyber Scan Line Overlay on Tab Enter */}
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute -top-3 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4ade80] to-transparent z-20 pointer-events-none"
          />

          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
