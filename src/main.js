import './styles.css';
import { h, render, Component } from 'preact';
import { useState, useCallback, useEffect } from 'preact/hooks';
import { html } from 'htm/preact';

const showUndefined = true;
const showEmptyStrings = true;

const isISODate = (value) => {
  return typeof value === 'string' && value.length >= 20 && value.length <= 29 &&
    value[4] === '-' && value[7] === '-' && value[10] === 'T';
};

const formatDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const formatPrimitive = (value) => {
  if (value === undefined) return showUndefined ? 'undefined' : '';
  if (Number.isNaN(value)) return 'NaN';
  if (value instanceof Date) return formatDate(value);
  if (isISODate(value)) return formatDate(value);
  if (value === '') return showEmptyStrings ? html`<span className="empty-string">""</span>` : '';
  if (typeof value === 'string') return makeUrlsClickable(value);
  return value;
};

const makeUrlsClickable = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return html`<a key=${index} href=${part} target="_blank" rel="noopener noreferrer">
            ${part}
          </a>`;
    }
    return part;
  });
};

const getCellType = (content) => {
  if (content === undefined) return 'undefined';
  if (content === null) return 'null';
  if (Number.isNaN(content)) return 'nan';
  if (content instanceof Date) return 'date';
  const type = typeof content;
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'string') {
    if (isISODate(content)) return 'date';
    if (/^-?\d+(\.\d+)?$/.test(content)) return 'number-string';
    return 'string';
  }
  if (type === 'object') return 'complex';
  return 'other';
};

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isComplexType = (value) => typeof value === 'object' && value !== null;
const isPrimitive = (value) => !isComplexType(value);

const TableCell = ({ content, depth, defaultOpenLevels }) => {
  const cellType = getCellType(content);
  let cellContent;

  switch (cellType) {
    case 'complex':
      cellContent = renderContent(content, depth + 1, defaultOpenLevels);
      break;
    case 'date':
    case 'number':
    case 'number-string':
    case 'string':
    case 'undefined':
    case 'nan':
      cellContent = formatPrimitive(content);
      break;
    case 'boolean':
      cellContent = content ? '✓' : '•';
      break;
    default:
      cellContent = content === null ? 'null' : content;
  }

  return html`<td class="${cellType}-cell">${cellContent}</td>`;
};

const TableHeader = ({ content }) => html`<th>${content}</th>`;

const PrimitiveArrayTable = ({ arr }) => (
  html`<table class="array-table">
        <tbody>
          <tr>
            ${arr.map((item, index) => {
    const cellType = getCellType(item);
    return html`<td key=${index} class="${cellType}-cell">${formatPrimitive(item)}</td>`;
  })}
          </tr>
        </tbody>
      </table>`
);

const BlueHeader = ({ isArray, itemCount, isCollapsed, onToggle }) => (
  html`<div class="blue-header" data-toggleable="true" onClick=${onToggle}>
        <span class="toggle-indicator">${isCollapsed ? '▶' : '▼'}</span>
        ${isArray ? 'Array ' : 'Object '}
        <span class="item-count">${itemCount} items</span>
      </div>`
);

const CollapsibleWrapper = ({ children, depth, defaultOpenLevels, isArray, itemCount }) => {
  const [isCollapsed, setIsCollapsed] = useState(depth >= defaultOpenLevels);

  useEffect(() => {
    setIsCollapsed(depth >= defaultOpenLevels);
  }, [depth, defaultOpenLevels]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return html`<div class="blue-wrapper ${isCollapsed ? 'collapsed' : ''}" data-depth=${depth}>
        ${BlueHeader({ isArray, itemCount, isCollapsed, onToggle: toggleCollapse })}
        <div class="content">${children}</div>
      </div>`;
};

const renderContent = (value, depth, defaultOpenLevels) => {
  if (Array.isArray(value)) return html`<${ArrayTable} arr=${value} depth=${depth} defaultOpenLevels=${defaultOpenLevels} />`;
  if (isObject(value)) return html`<${ObjectTable} json=${value} depth=${depth} defaultOpenLevels=${defaultOpenLevels} />`;
  return formatPrimitive(value);
};

const ArrayTable = ({ arr, depth = 0, defaultOpenLevels }) => {
  if (arr.length === 0) return html`<div class="empty-array">[]</div>`;
  if (arr.every(isPrimitive)) return html`<${PrimitiveArrayTable} arr=${arr} />`;

  const headers = Array.from(new Set(arr.flatMap(item => isObject(item) ? Object.keys(item) : ['Value'])));

  return html`<${CollapsibleWrapper} depth=${depth} defaultOpenLevels=${defaultOpenLevels} isArray=${true} itemCount=${arr.length}>
        <table class="content">
          <thead>
            <tr>
              ${headers.map((header, index) => html`<${TableHeader} key=${`header-${index}`} content=${header} />`)}
            </tr>
          </thead>
          <tbody>
            ${arr.map((item, rowIndex) => html`<tr key=${`row-${rowIndex}`}>
              ${headers.map((header, colIndex) => html`<${TableCell} key=${`cell-${rowIndex}-${colIndex}`} content=${isObject(item) ? item[header] : header === 'Value' ? item : ''} depth=${depth} defaultOpenLevels=${defaultOpenLevels} />`)}
            </tr>`)}
          </tbody>
        </table>
      </${CollapsibleWrapper}>`;
};

const ObjectTable = ({ json, depth = 0, defaultOpenLevels }) => {
  if (json === undefined) return html`<div>Error: Invalid JSON data</div>`;
  if (json === null) return html`<div>null</div>`;
  if (Array.isArray(json)) return html`<${ArrayTable} arr=${json} depth=${depth} defaultOpenLevels=${defaultOpenLevels} />`;

  const entries = Object.entries(json);

  return html`<${CollapsibleWrapper} depth=${depth} defaultOpenLevels=${defaultOpenLevels} isArray=${false} itemCount=${entries.length}>
        <table class="content">
          <tbody>
            ${entries.map(([key, value], index) => html`<tr key=${`row-${index}`}>
              <${TableHeader} content=${key} />
              <${TableCell} content=${value} depth=${depth} defaultOpenLevels=${defaultOpenLevels} />
            </tr>`)}
          </tbody>
        </table>
      </${CollapsibleWrapper}>`;
};

const GenerateJsObjectHtml = ({ jsonData, defaultOpenLevels = 2 }) => {
  if (jsonData === undefined) return html`<div>Error: Invalid JSON data</div>`;
  if (jsonData === null) return html`<div>null</div>`;
  if (typeof jsonData === 'string') return html`<div class="plain-string">${jsonData}</div>`;
  if (jsonData instanceof Date) return html`<div class="plain-date">${formatDate(jsonData)}</div>`;

  return html`<div class="container">
        <${ObjectTable} json=${jsonData} depth=${0} defaultOpenLevels=${defaultOpenLevels} />
      </div>`;
};

const App = ({ contents }) => {
  const [defaultOpenLevels, setDefaultOpenLevels] = useState(3);

  let parsedContents;
  try {
    parsedContents = JSON.parse(contents);
  } catch (e) {
    parsedContents = contents;
  }

  const sampleData = {
    person: {
      name: "John Doe",
      age: 30,
      contacts: [
        { type: "email", value: "john@example.com" },
        { type: "phone", value: "123-456-7890" }
      ],
      birthday: new Date("1993-05-15"),
      website: "https://example.com",
      active: true
    },
    settings: {
      notifications: true,
      theme: "dark"
    }
  };

  return html`<div class="json-viewer-table">
        <div class="slider-container">
          <label htmlFor="open-levels">Open Levels: ${defaultOpenLevels}</label>
          <input
            type="range"
            id="open-levels"
            min="1"
            max="10"
            step="1"
            value=${defaultOpenLevels}
            onChange=${(e) => setDefaultOpenLevels(Number(e.target.value))}
          />
        </div>
        ${GenerateJsObjectHtml({ jsonData: parsedContents, defaultOpenLevels })}
      </div>`;
};

const isValidJSON = (str) => {
  if (typeof str !== 'string') return false;
  try {
    const result = JSON.parse(str);
    return typeof result === 'object' && result !== null;
  } catch (e) {
    return false;
  }
};

const findPreElement = () => {
  const children = document.body.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.tagName === "PRE") return child;
  }
  return null;
};

const isLikelyJSON = (content) => {
  // Check if content starts with { or [ after whitespace
  return /^\s*[\{\[]/.test(content);
};

async function main() {
  // Find the PRE element
  const preElement = findPreElement();
  if (!preElement) {
    console.log('No body>pre found');
    return;
  }

  const content = preElement.textContent;
  if (!content) {
    console.log('No content in body>pre');
    return;
  }

  // Check if content looks like JSON
  if (!isLikelyJSON(content)) {
    console.log('Content does not appear to be JSON');
    return;
  }

  // Try parsing the content
  try {
    const parsedContent = JSON.parse(content);
    if (typeof parsedContent !== "object" || parsedContent === null) {
      console.log('Content is valid JSON but not an object or array');
      return;
    }

    // Remove the PRE element and set up formatting
    preElement.remove();
    let container = document.getElementById('preview');
    if (!container) {
      container = document.createElement('div');
      container.id = 'preview';
      document.body.appendChild(container);
    }

    document.body.innerHTML = '';
    render(html`<${App} contents=${content} />`, document.body);

  } catch (error) {
    console.log('Content does not parse as valid JSON');
    return;
  }
}

main();


