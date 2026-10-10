/**
 * High-precision A4 Print Engine for Invoices, Quotations, Receipts & Payment Letters
 * Creates an isolated, styled print frame to guarantee crisp printing without modal backdrop artifacts.
 */
export function printDocument(elementOrId, documentTitle = 'Official Document') {
  try {
    let targetEl = null;
    if (typeof elementOrId === 'string') {
      targetEl = document.getElementById(elementOrId);
    } else if (elementOrId && elementOrId.nodeType === 1) {
      targetEl = elementOrId;
    }

    if (!targetEl) {
      console.warn('printDocument: Element not found, falling back to window.print()');
      window.print();
      return;
    }

    // Collect all external CSS and inline stylesheets currently in page
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    // Create a temporary hidden iframe
    const iframe = document.createElement('iframe');
    iframe.name = 'print_frame_' + Date.now();
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${documentTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        ${styleTags}
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 16mm 14mm 16mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 11.5px !important;
            line-height: 1.45 !important;
            width: 100% !important;
            height: auto !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
        </style>
      </head>
      <body style="padding: 0; margin: 0; background: #ffffff;">
        <div style="width: 100%; max-width: 100%; margin: 0 auto; page-break-inside: avoid;">
          ${targetEl.innerHTML}
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Ensure images and fonts load before triggering print dialog
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print execution error:', err);
        window.print();
      } finally {
        setTimeout(() => {
          try {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          } catch (_) {}
        }, 5000);
      }
    }, 300);
  } catch (error) {
    console.error('Failed to trigger isolated print:', error);
    window.print();
  }
}
