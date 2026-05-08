import { useState, useMemo, useCallback } from 'react';
import { CodeFile, CodeData, DEMO_FILES } from './code-types';
import { detectLanguage } from '@/utils/sovereign-utils';

export const useCodeExplorer = (initialData?: CodeData) => {
  const files = initialData?.files ?? DEMO_FILES;
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(files[0]?.type === 'file' ? files[0] : null);
  const [searchQuery, setSearchQuery] = useState('');

  const language = useMemo(() => selectedFile ? detectLanguage(selectedFile.name) : '', [selectedFile]);

  const onSelect = useCallback((path: string, node: CodeFile) => {
    setSelectedPath(path);
    setSelectedFile(node);
  }, []);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    // Simple recursive filter for demo
    const filterNodes = (nodes: CodeFile[]): CodeFile[] => {
      return nodes.reduce((acc, node) => {
        if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          acc.push(node);
        } else if (node.type === 'folder' && node.children) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            acc.push({ ...node, children: filteredChildren });
          }
        }
        return acc;
      }, [] as CodeFile[]);
    };
    return filterNodes(files);
  }, [files, searchQuery]);

  return {
    files: filteredFiles,
    selectedPath,
    selectedFile,
    searchQuery,
    setSearchQuery,
    language,
    onSelect
  };
};
