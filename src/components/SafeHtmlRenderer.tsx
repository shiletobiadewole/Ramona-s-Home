import React, { useMemo } from 'react';

interface SafeHtmlRendererProps {
  html: string;
  hideEmbeddedForm?: boolean;
}

const ALLOWED_TAGS = new Set([
  'p',
  'div',
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'br',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tr',
  'td',
  'th',
  'a',
  'header',
  'main',
  'section',
  'article',
  'footer',
]);

const SKIPPED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'svg',
  'input',
  'textarea',
  'select',
  'button',
  'meta',
  'link',
  'base',
  'noscript',
]);

const ALLOWED_STYLE_PROPERTIES = new Set([
  'color',
  'background-color',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'border-collapse',
  'border-spacing',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'text-decoration',
  'vertical-align',
  'display',
  'width',
  'max-width',
  'height',
  'overflow-wrap',
  'word-break',
]);

const CLASS_STYLE_MAP: Record<string, string> = {
  container: 'w-full bg-white border border-[#B6AF9D]/70 rounded-sm overflow-hidden',
  header: 'px-6 py-5 bg-[#FDFAF0] border-b border-[#E8E1D4]',
  brand: 'text-lg sm:text-xl font-semibold tracking-wide text-[#151513]',
  'brand-caption': 'text-[10px] tracking-[0.25em] uppercase text-[#878276] mt-0.5',
  content: 'p-5 sm:p-6 space-y-4',
  warning:
    'flex items-start gap-3 p-4 bg-[#FFF1DF] border border-[#D99B43] border-l-4 border-l-[#C57B21] rounded-sm text-[#75502E]',
  'warning-icon':
    'w-7 h-7 min-w-[28px] rounded-full bg-[#F4D4A8] text-[#8B4C14] flex items-center justify-center font-bold text-sm shrink-0',
  intro: 'text-sm text-[#534F46] leading-relaxed',
  requested: 'bg-[#FCF0D8] border border-[#E8DDC7] rounded-sm p-4 space-y-1',
  label: 'text-[10px] font-bold tracking-[0.14em] uppercase text-[#878276]',
  'requested-date': 'font-semibold text-base text-[#151513]',
  'requested-time': 'text-sm text-[#534F46]',
  'section-description': 'text-xs text-[#878276]',
  'slot-list': 'grid gap-2.5 pt-1',
  slot: 'flex items-center justify-between gap-3 border border-[#B6AF9D] rounded-sm p-3.5 bg-[#FDFAF0]',
  'slot-info': 'flex-1',
  'slot-number': 'block text-[10px] font-bold tracking-wider uppercase text-[#878276]',
  'slot-date': 'block text-sm font-semibold text-[#151513] mt-0.5',
  'slot-time': 'block text-xs text-[#534F46]',
  available: 'bg-[#EDF3E8] text-[#47653B] rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0',
  footer: 'bg-[#FDFAF0] border-t border-[#E8E1D4] px-6 py-4 text-center text-xs text-[#878276]',
  'footer-brand': 'text-sm font-medium text-[#151513] mb-1',
  'viewing-success': 'w-full py-6 px-4 flex items-center justify-center bg-[#FDFAF0] text-[#151513] rounded-sm',
  'success-card': 'w-full max-w-[520px] p-6 sm:p-9 bg-white border border-[#E9E2D4] rounded-md text-center space-y-4',
  'success-icon': 'hidden',
  'success-divider': 'w-12 h-[3px] mx-auto bg-[#FADF1E] rounded-full',
  'success-message': 'max-w-[420px] mx-auto text-sm sm:text-base text-[#534F46] leading-relaxed',
  'success-footer': 'pt-5 mt-5 border-t border-[#E9E2D4] text-xs text-[#878276]',
};

function kebabToCamelCase(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
}

function isSafeStyleValue(value: string): boolean {
  const lowered = value.toLowerCase();
  if (
    lowered.includes('url(') ||
    lowered.includes('expression(') ||
    lowered.includes('javascript:') ||
    lowered.includes('vbscript:') ||
    lowered.includes('-moz-binding') ||
    lowered.includes('@import')
  ) {
    return false;
  }
  return true;
}

function parseSafeStyle(rawStyle: string | null): React.CSSProperties | undefined {
  if (!rawStyle) {
    return undefined;
  }

  const styleObj: Record<string, string> = {};
  const declarations = rawStyle.split(';');

  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx <= 0) continue;

    const rawProp = decl.slice(0, colonIdx).trim().toLowerCase();
    const rawVal = decl.slice(colonIdx + 1).replace(/!important/gi, '').trim();

    if (!rawProp || !rawVal) continue;
    if (!ALLOWED_STYLE_PROPERTIES.has(rawProp)) continue;
    if (!isSafeStyleValue(rawVal)) continue;

    styleObj[kebabToCamelCase(rawProp)] = rawVal;
  }

  return Object.keys(styleObj).length > 0
    ? (styleObj as React.CSSProperties)
    : undefined;
}

function sanitizeHref(rawHref: string | null): string | null {
  if (!rawHref) return null;
  const trimmed = rawHref.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed, 'https://ramonashome.pages.dev');
    if (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:' ||
      parsed.protocol === 'mailto:' ||
      parsed.protocol === 'tel:'
    ) {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

function isHiddenPreheader(el: Element): boolean {
  const rawStyle = (el.getAttribute('style') || '').toLowerCase().replace(/\s+/g, '');
  return (
    rawStyle.includes('display:none') ||
    (rawStyle.includes('max-height:0') && rawStyle.includes('opacity:0'))
  );
}

function mapClassNames(el: Element): string | undefined {
  const rawClass = el.getAttribute('class');
  if (!rawClass) return undefined;
  const mapped = rawClass
    .split(/\s+/)
    .map((cls) => CLASS_STYLE_MAP[cls])
    .filter(Boolean);
  return mapped.length > 0 ? mapped.join(' ') : undefined;
}

function convertDomNode(
  node: Node,
  key: string,
  hideEmbeddedForm: boolean
): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  if (SKIPPED_TAGS.has(tag) || isHiddenPreheader(el)) {
    return null;
  }

  if (hideEmbeddedForm) {
    if (tag === 'form' || tag === 'footer') {
      return null;
    }
    const cls = el.getAttribute('class') || '';
    if (cls.includes('section-description') || cls.includes('slot-list')) {
      return null;
    }
    if (tag === 'h2' && /choose an available viewing time/i.test(el.textContent || '')) {
      return null;
    }
  }

  const children = Array.from(el.childNodes)
    .map((child, idx) => convertDomNode(child, `${key}-${idx}`, hideEmbeddedForm))
    .filter((child) => child !== null && child !== undefined);

  if (!ALLOWED_TAGS.has(tag)) {
    return React.createElement(React.Fragment, { key }, ...children);
  }

  const props: Record<string, unknown> = { key };
  const mappedClass = mapClassNames(el);
  if (mappedClass) {
    props.className = mappedClass;
  } else if (tag === 'h1') {
    props.className = 'text-xl sm:text-2xl font-medium text-[#151513] leading-snug';
  } else if (tag === 'h2') {
    props.className = 'text-lg font-medium text-[#151513]';
  }

  const safeStyle = parseSafeStyle(el.getAttribute('style'));
  if (safeStyle && tag === 'table') {
    const adjusted: React.CSSProperties = { ...safeStyle };
    if (adjusted.width === '100%') {
      adjusted.maxWidth = '100%';
    }
    props.style = adjusted;
  } else if (safeStyle) {
    props.style = safeStyle;
  }

  if (tag === 'td' || tag === 'th') {
    const colSpan = Number(el.getAttribute('colspan'));
    if (Number.isInteger(colSpan) && colSpan > 1 && colSpan <= 12) {
      props.colSpan = colSpan;
    }
    const rowSpan = Number(el.getAttribute('rowspan'));
    if (Number.isInteger(rowSpan) && rowSpan > 1 && rowSpan <= 12) {
      props.rowSpan = rowSpan;
    }
    const align = el.getAttribute('align');
    if (align === 'left' || align === 'center' || align === 'right') {
      props.style = { ...(props.style as React.CSSProperties), textAlign: align };
    }
  }

  if (tag === 'a') {
    const safeHref = sanitizeHref(el.getAttribute('href'));
    if (!safeHref) {
      return React.createElement('span', props, ...children);
    }
    props.href = safeHref;
    props.className = 'text-[#57482D] underline hover:text-[#423620]';
    if (safeHref.startsWith('http://') || safeHref.startsWith('https://')) {
      props.target = '_blank';
      props.rel = 'noopener noreferrer';
    }
  }

  if (tag === 'br' || tag === 'hr') {
    return React.createElement(tag, props);
  }

  return React.createElement(tag, props, ...children);
}

export function SafeHtmlRenderer({
  html,
  hideEmbeddedForm = false,
}: SafeHtmlRendererProps) {
  const renderedContent = useMemo(() => {
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
      return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nodes = Array.from(doc.body.childNodes)
      .map((child, idx) => convertDomNode(child, `root-${idx}`, hideEmbeddedForm))
      .filter((child) => child !== null && child !== undefined);

    return nodes;
  }, [html, hideEmbeddedForm]);

  return (
    <div className="w-full overflow-x-auto">
      {renderedContent}
    </div>
  );
}
