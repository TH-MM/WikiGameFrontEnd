import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

export default function ArticleViewer({ title, htmlContent, onInternalLinkClick }) {
  const contentRef = useRef(null);

  useEffect(() => {
    const handleLinkClick = (e) => {
      let target = e.target;
      // Find closest anchor tag in case we clicked an element inside the link
      while (target && target.tagName !== 'A' && target !== contentRef.current) {
        target = target.parentNode;
      }

      if (target && target.tagName === 'A') {
        const href = target.getAttribute('href');
        
        // Internal wiki link
        if (href && href.startsWith('/wiki/')) {
          e.preventDefault();
          let title = href.replace('/wiki/', '');
          // Handle anchor links in wiki pages e.g., /wiki/Title#Section
          if (title.includes('#')) {
            title = title.split('#')[0];
          }
          title = decodeURIComponent(title).replace(/_/g, ' ');
          
          if (title) {
            onInternalLinkClick(title);
          }
        } else {
          // Disable external or non-standard links completely
          e.preventDefault();
        }
      }
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener('click', handleLinkClick);
    }

    return () => {
      if (container) {
        container.removeEventListener('click', handleLinkClick);
      }
    };
  }, [onInternalLinkClick]);

  // Sanitize HTML
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'div', 'span', 'img', 'sup', 'sub', 'br'],
    ALLOWED_ATTR: ['href', 'title', 'class', 'src', 'alt', 'width', 'height', 'style', 'dir']
  });

  return (
    <div className="bg-white rounded-sm shadow-sm border border-slate-300">
      <div 
        ref={contentRef}
        className="wiki-content"
      >
        <h1 id="firstHeading" className="firstHeading mw-first-heading mb-4">
          {title}
        </h1>
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>
    </div>
  );
}
