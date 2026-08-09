import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple, robust custom Markdown parser for travel itineraries
  const lines = content.split('\n');

  const renderFormattedText = (text: string) => {
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-gray-300">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-black/40 text-primary font-mono text-xs">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = (key: number) => {
    if (tableRows.length === 0) return null;
    const header = tableRows[0];
    const body = tableRows.slice(1);

    return (
      <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-black/30">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-gray-200">
              {header.map((col, idx) => (
                <th key={idx} className="p-3 font-semibold">{renderFormattedText(col.trim())}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {body.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-3">{renderFormattedText(cell.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table line: | col 1 | col 2 |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      // Check if it's separator line like | :--- | :--- |
      if (!line.includes('---')) {
        tableRows.push(cells);
      }
      inTable = true;
      continue;
    } else if (inTable) {
      elements.push(flushTable(i));
      tableRows = [];
      inTable = false;
    }

    // Horizontal Rule: ---
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={i} className="my-4 border-white/10" />);
      continue;
    }

    // Heading 3: ###
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2 flex items-center gap-2">
          {renderFormattedText(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }

    // Heading 4: ####
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-base font-semibold text-primary mt-3 mb-1.5">
          {renderFormattedText(line.replace('#### ', ''))}
        </h4>
      );
      continue;
    }

    // Heading 2: ##
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl font-extrabold text-white mt-5 mb-2">
          {renderFormattedText(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }

    // Checklist item: * [ ] or - [ ]
    if (/^[\*\-]\s*\[([ xX])\]\s*(.*)/.test(line)) {
      const match = line.match(/^[\*\-]\s*\[([ xX])\]\s*(.*)/);
      const isChecked = match && (match[1] === 'x' || match[1] === 'X');
      const text = match ? match[2] : '';
      elements.push(
        <div key={i} className="flex items-center gap-2.5 my-1.5 text-sm text-gray-200">
          <input 
            type="checkbox" 
            readOnly 
            checked={isChecked || false} 
            className="w-4 h-4 rounded bg-white/10 border-white/20 text-primary accent-primary" 
          />
          <span>{renderFormattedText(text)}</span>
        </div>
      );
      continue;
    }

    // Bullet point: * or -
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 my-1 text-sm text-gray-300 pl-2">
          <span className="text-primary font-bold mt-0.5">•</span>
          <div className="flex-1 leading-relaxed">{renderFormattedText(line.trim().slice(2))}</div>
        </div>
      );
      continue;
    }

    // Numbered list: 1. 2.
    if (/^\d+\.\s+(.*)/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (match) {
        elements.push(
          <div key={i} className="flex items-start gap-2.5 my-1 text-sm text-gray-300 pl-2">
            <span className="text-amber-400 font-semibold text-xs mt-0.5 bg-amber-400/10 px-1.5 py-0.5 rounded">{match[1]}</span>
            <div className="flex-1 leading-relaxed">{renderFormattedText(match[2])}</div>
          </div>
        );
        continue;
      }
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm leading-relaxed text-gray-200 my-1">
        {renderFormattedText(line)}
      </p>
    );
  }

  if (inTable && tableRows.length > 0) {
    elements.push(flushTable(lines.length));
  }

  return <div className="space-y-1">{elements}</div>;
}
