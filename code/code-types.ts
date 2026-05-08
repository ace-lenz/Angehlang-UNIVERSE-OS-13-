// Plan Item ID: TI-1
import { CodeFile } from '@/types';

export type { CodeFile };

export interface CodeData {
  files: CodeFile[];
  title?: string;
  description?: string;
}

export const LANGUAGE_COLORS: Record<string, string> = {
  typescript: '#3178c6',
  javascript: '#f7df1e',
  python: '#3572a5',
  css: '#563d7c',
  html: '#e34f26',
  json: '#cbcb41',
  rust: '#dea584',
  go: '#00add8',
  yaml: '#cb171e',
  sh: '#89e051',
  angehlang: '#a855f7',
};

export const DEMO_FILES: CodeFile[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      { name: 'kernel.angeh', type: 'file', content: `;; Angehlang Universe OS v13.0\n(defconfig OS-CORE\n  :mode "Sovereign-Infinity"\n  :refinement-loop true)\n\n(defn initialize-system []\n  (log "[System] Initializing Sovereign Core...")\n  (mount-vfs "/root")\n  (start-agent :architect))\n` },
      { name: 'App.tsx', type: 'file', content: `import React from 'react';\nimport { SovereignShell } from './Shell';\n\nexport const App = () => (\n  <SovereignShell />\n);` },
    ],
  },
  { name: 'package.json', type: 'file', content: `{\n  "name": "sovereign-core",\n  "version": "1.0.0"\n}` },
];

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
