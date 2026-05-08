/**
 * OutputHandler.ts - ZIP, Copy, Download Manager
 * 
 * Handles all output options: view, copy, download ZIP, folder, per file
 */

import type { TemplateFile, GeneratedProject, ProjectWiki } from './TemplateGeneratorEngine';
import type { WikiContent } from './WikiGenerator';

export type OutputFormat = 'zip' | 'folder' | 'files' | 'clipboard';
export type FileFormat = 'txt' | 'json' | 'md';

export interface OutputOptions {
  format: OutputFormat;
  includeWiki: boolean;
  includeConfig: boolean;
  projectName: string;
}

export interface DownloadableFile {
  name: string;
  path: string;
  content: string;
}

class OutputHandler {
  prepareForDownload(project: GeneratedProject, options: OutputOptions): DownloadableFile[] {
    const files: DownloadableFile[] = [];

    // Add project files
    for (const file of project.files) {
      files.push({
        name: file.name,
        path: file.path,
        content: file.content,
      });
    }

    // Add wiki if requested
    if (options.includeWiki) {
      files.push({
        name: `${options.projectName}-WIKI.md`,
        path: 'docs/WIKI.md',
        content: this.generateWikiMarkdown(project.wiki),
      });
    }

    return files;
  }

  private generateWikiMarkdown(wiki: WikiContent | ProjectWiki): string {
    const lines: string[] = [];
    
    if ('topic' in wiki) {
      // WikiContent type
      lines.push(`# ${wiki.topic}`);
      lines.push('');
      lines.push(`> Generated: ${wiki.timestamp}`);
      lines.push(`> Category: ${wiki.category}`);
      lines.push(`> Languages: ${wiki.languages.join(', ')}`);
      lines.push('');
      lines.push('## Usage Guides');
      lines.push('');
      for (const guide of wiki.usage) {
        lines.push(`### ${guide.title}`);
        lines.push('```bash');
        lines.push(guide.command);
        lines.push('```');
        lines.push(guide.description);
        lines.push('');
      }
    } else {
      // ProjectWiki type
      lines.push(`# ${wiki.title}`);
      lines.push('');
      lines.push(`> Generated: ${new Date().toISOString()}`);
      lines.push('');
      lines.push('## Overview');
      lines.push(wiki.overview);
      lines.push('');
      if (wiki.usage.length > 0) {
        lines.push('## Usage');
        lines.push('');
        wiki.usage.forEach(u => lines.push(`- ${u}`));
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  // Copy to clipboard helper
  generateClipboardContent(project: GeneratedProject): string {
    const files = project.files;
    const lines: string[] = [];

    for (const file of files) {
      lines.push('='.repeat(60));
      lines.push(`FILE: ${file.name}`);
      lines.push(`PATH: ${file.path}`);
      lines.push(`LANGUAGE: ${file.language}`);
      lines.push(`DESCRIPTION: ${file.description}`);
      lines.push('='.repeat(60));
      lines.push('');
      lines.push(file.content);
      lines.push('');
    }

    return lines.join('\n');
  }

  // Generate individual download links
  generateDownloadLinks(files: DownloadableFile[], baseName: string): { zip: Blob; folder: Map<string, string> } {
    // Create ZIP-compatible content
    const zipContent = this.createZipContent(files);
    const zipBlob = new Blob([zipContent], { type: 'application/zip' });

    // Create folder structure
    const folderMap = new Map<string, string>();
    for (const file of files) {
      folderMap.set(file.path, file.content);
    }

    return { zip: zipBlob, folder: folderMap };
  }

  private createZipContent(files: DownloadableFile[]): Uint8Array {
    // Simple ZIP format using JSZIP-compatible structure
    // For a real implementation, use a library like JSZip
    const encoder = new TextEncoder();
    const content = files
      .map(f => `${f.path}\n${'-'.repeat(40)}\n${f.content}`)
      .join('\n\n');
    
    return encoder.encode(content);
  }

  // Export as JSON
  exportAsJson(project: GeneratedProject): string {
    return JSON.stringify({
      name: project.name,
      category: project.category,
      intent: {
        category: project.intent.category,
        categoryName: project.intent.categoryName,
        intent: project.intent.intent,
        languageCount: project.intent.languageCount,
        languages: project.intent.languages,
      },
      selection: {
        primary: {
          name: project.selection.primary.name,
          fullName: project.selection.primary.fullName,
        },
        totalLanguages: project.selection.totalLanguages,
        selectionReason: project.selection.selectionReason,
      },
      files: project.files.map(f => ({
        name: f.name,
        path: f.path,
        language: f.language,
        description: f.description,
      })),
      wiki: project.wiki,
    }, null, 2);
  }

  // Export as markdown README
  exportAsMarkdown(project: GeneratedProject): string {
    const lines: string[] = [];

    lines.push(`# ${project.name}`);
    lines.push(`> ${project.category} Project`);
    lines.push('');
    lines.push('*Generated by Angehlang Universe OS Template Engine*');
    lines.push('');

    lines.push('## Project Info');
    lines.push(`- **Name:** ${project.name}`);
    lines.push(`- **Category:** ${project.intent.categoryName}`);
    lines.push(`- **Primary Language:** ${project.selection.primary.fullName}`);
    lines.push(`- **Total Languages:** ${project.selection.totalLanguages}`);
    lines.push('');

    lines.push('## Languages');
    for (const lang of project.selection.fallbacks) {
      lines.push(`- ${lang.fullName}`);
    }
    lines.push('');

    lines.push('## File Structure');
    lines.push('');
    for (const file of project.files) {
      lines.push(`- \`${file.path}\` (${file.language})`);
    }
    lines.push('');

    lines.push('## Getting Started');
    lines.push('');
    const usageItems = Array.isArray(project.wiki.usage) ? project.wiki.usage : [];
    usageItems.forEach((guide: string, idx: number) => {
      lines.push(`### Step ${idx + 1}`);
      lines.push(guide);
      lines.push('');
    });

    lines.push('## Best Practices');
    lines.push('');
    for (const practice of project.wiki.bestPractices) {
      lines.push(`- ${practice}`);
    }
    lines.push('');

    lines.push('## Common Errors');
    lines.push('');
    for (const error of project.wiki.errors) {
      lines.push(`### ${error.error}`);
      lines.push(`**Solution:** ${error.solution}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  // Generate preview HTML for in-app viewing
  generatePreviewHTML(project: GeneratedProject): string {
    const files = project.files;

    return `
<!DOCTYPE html>
<html>
<head>
  <title>${project.name} - Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
      background: #0d0d0f; color: #e4e4e7;
      padding: 2rem; max-width: 1200px; margin: 0 auto;
    }
    h1 { color: #22d3ee; margin-bottom: 1rem; }
    h2 { color: #a855f7; margin: 1.5rem 0 0.5rem; }
    .info { display: flex; gap: 2rem; margin-bottom: 1rem; }
    .info span { color: #71717a; }
    .file { 
      background: #18181b; border: 1px solid #27272a;
      border-radius: 8px; margin-bottom: 1rem; overflow: hidden;
    }
    .file-header { 
      background: #27272a; padding: 0.75rem 1rem;
      display: flex; justify-content: space-between;
    }
    .file-name { color: #22d3ee; font-weight: 600; }
    .file-lang { color: #71717a; font-size: 0.875rem; }
    .file-content { 
      padding: 1rem; overflow-x: auto;
      font-size: 0.875rem; line-height: 1.5;
    }
    pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; }
    .badge { 
      display: inline-block; padding: 0.25rem 0.5rem;
      background: #27272a; border-radius: 4px;
      font-size: 0.75rem; color: #22d3ee;
    }
  </style>
</head>
<body>
  <h1>${project.name}</h1>
  <div class="info">
    <span>Category: <b>${project.intent.categoryName}</b></span>
    <span>Language: <b>${project.selection.primary.fullName}</b></span>
    <span>Files: <b>${files.length}</b></span>
  </div>

  <h2>Files</h2>
  ${files.map(f => `
    <div class="file">
      <div class="file-header">
        <span class="file-name">${f.path}</span>
        <span class="file-lang">${f.language}</span>
      </div>
      <div class="file-content">
        <pre>${this.escapeHtml(f.content.slice(0, 500))}${f.content.length > 500 ? '\n...' : ''}</pre>
      </div>
    </div>
  `).join('')}

  <h2>Quick Start</h2>
  <div class="file">
    <div class="file-content">
      <pre>${Array.isArray(project.wiki.usage) ? project.wiki.usage.join('\n') : ''}</pre>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Download helper
  downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Copy to clipboard
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}

export const outputHandler = new OutputHandler();
export default outputHandler;