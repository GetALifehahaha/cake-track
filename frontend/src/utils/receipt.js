const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const toAmount = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const formatMoney = (value, fallback = 0) =>
    toAmount(value, fallback).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const formatDate = (value) => {
    const parsed = value ? new Date(value) : null;
    if (!parsed || Number.isNaN(parsed.getTime())) {
        return {
            date: 'N/A',
            time: 'N/A',
            dateTime: 'N/A',
        };
    }

    return {
        date: parsed.toLocaleDateString('en-PH'),
        time: parsed.toLocaleTimeString('en-PH'),
        dateTime: parsed.toLocaleString('en-PH'),
    };
};

const mapReceiptItems = (transactionItems = []) =>
    transactionItems.map((item) => {
        const quantity = toAmount(item?.quantity ?? item?.amount, 0);
        const productName = item?.product?.name || item?.name || 'Item';
        const variantLabel = item?.product_variant?.label || item?.label || '';
        const unitPrice = toAmount(item?.product_variant?.price, toAmount(item?.price, 0));
        const lineBefore = toAmount(item?.line_total_before, unitPrice * quantity);
        const lineAfter = toAmount(item?.line_total_after, lineBefore);

        return {
            quantity,
            productName,
            variantLabel,
            unitPrice,
            lineBefore,
            lineAfter,
        };
    });

export const buildReceiptViewModel = ({ transaction, business, fallbackTotal = 0, fallbackPaid = 0 }) => {
    const items = mapReceiptItems(transaction?.transaction_items || []);
    const computedGross = items.reduce((sum, item) => sum + item.lineBefore, 0);
    const computedNet = items.reduce((sum, item) => sum + item.lineAfter, 0);

    const grossTotal = toAmount(transaction?.gross_total, computedGross || toAmount(fallbackTotal, 0));
    const netTotal = toAmount(transaction?.net_total, computedNet || toAmount(fallbackTotal, 0));
    const paidAmount = toAmount(transaction?.paid_amount, toAmount(fallbackPaid, netTotal));
    const changeAmount = toAmount(transaction?.change, paidAmount - netTotal);
    const discountAmount = Math.max(grossTotal - netTotal, 0);
    const discountName = typeof transaction?.discount === 'string'
        ? transaction.discount
        : transaction?.discount?.name;
    const normalizedCustomerName = String(
        transaction?.customer_name
        || transaction?.customerName
        || ''
    ).trim();

    const dateInfo = formatDate(transaction?.created_at);

    return {
        businessName: business?.business_name || "Michelle's Cakes and Cafe",
        businessAddress: business?.address || '',
        businessTin: business?.tin || '',
        businessContact: business?.contact_number || '',
        businessMessage: business?.message || '',
        date: dateInfo.date,
        time: dateInfo.time,
        dateTime: dateInfo.dateTime,
        displayId: transaction?.display_id || transaction?.id || 'N/A',
        orderNumber: transaction?.order_number || null,
        cashierName: `${transaction?.cashier?.first_name || ''} ${transaction?.cashier?.last_name || ''}`.trim() || 'N/A',
        paymentMethod: transaction?.payment_method || 'cash',
        orderType: transaction?.order_type || 'walk-in',
        customerName: normalizedCustomerName || null,
        discountName: discountName || null,
        discountAmount,
        vatAmount: toAmount(transaction?.vat_amount, grossTotal * 0.12),
        grossTotal,
        netTotal,
        paidAmount,
        changeAmount,
        items,
    };
};

export const buildReceiptPrintHtml = (receipt, documentTitle = 'Receipt') => {
    const itemsHtml = receipt.items.map((item) => {
        const variantHtml = item.variantLabel
            ? `<div class="item-variant">${escapeHtml(item.variantLabel)}</div>`
            : '';

        const lineAmount = item.lineAfter < item.lineBefore
            ? `<span class="line-before">${formatMoney(item.lineBefore)}</span><span>${formatMoney(item.lineAfter)}</span>`
            : `<span>${formatMoney(item.lineAfter)}</span>`;

        return `
            <tr>
                <td class="qty">${item.quantity}</td>
                <td class="item-name">
                    <div>${escapeHtml(item.productName)}</div>
                    ${variantHtml}
                </td>
                <td class="amount">${lineAmount}</td>
            </tr>
        `;
    }).join('');

    const discountRow = receipt.discountAmount > 0
        ? `
            <div class="total-row">
                <span>Discount (${escapeHtml(receipt.discountName || 'Applied')})</span>
                <span>-${formatMoney(receipt.discountAmount)}</span>
            </div>
        `
        : '';

    const orderHeader = receipt.orderNumber
        ? `
            <div class="order-highlight">
                <div class="order-number">${escapeHtml(receipt.orderNumber)}</div>
                ${receipt.customerName ? `<div class="order-customer">${escapeHtml(receipt.customerName)}</div>` : ''}
            </div>
        `
        : '';

    const footerMessage = receipt.businessMessage
        ? `<div class="footer-strong">${escapeHtml(receipt.businessMessage)}</div>`
        : '';

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8" />
                <title>${escapeHtml(documentTitle)}</title>
                <style>
    :root {
        --receipt-paper-width: 58mm;
        --receipt-inline-padding: 0.8mm;
    }
    body {
        margin: 0;
        padding: 0;
        font-family: 'Courier New', Courier, monospace;
        color: #111827;
        background: #ffffff;
        width: var(--receipt-paper-width);
        display: block;
    }
    .receipt {
        width: 100%;
        max-width: none;
        box-sizing: border-box;
        padding: 2mm var(--receipt-inline-padding);
    }
    .title {
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        text-align: center;
        margin: 0;
    }
    .sub {
        font-size: 11px;
        text-align: center;
        line-height: 1.3;
    }
    .tin-line {
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        line-height: 1.25;
        margin-top: 4px;
    }
    .order-highlight {
        text-align: center;
        margin: 8px 0 4px;
    }
    .order-number {
        font-size: 40px;
        font-weight: 800;
        line-height: 1;
    }
    .order-customer {
        font-size: 16px;
        font-weight: 700;
        line-height: 1.2;
        margin-top: 4px;
    }
    .separator {
        border-top: 1px dashed #9ca3af;
        margin: 8px 0;
    }
    .print-block {
        padding: 3px 0;
    }
    .meta-line {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        line-height: 1.35;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 4px;
    }
    th {
        text-align: left;
        font-size: 11px;
        padding: 4px 0;
        border-bottom: 1px dashed #9ca3af;
    }
    td {
        font-size: 11px;
        padding: 5px 0;
        vertical-align: top;
    }
    .qty {
        width: 32px;
        text-align: center;
    }
    .amount {
        width: 90px;
        text-align: right;
        white-space: nowrap;
    }
    .item-name {
        padding-right: 6px;
    }
    .item-variant {
        font-size: 10px;
        color: #6b7280;
    }
    .line-before {
        text-decoration: line-through;
        color: #6b7280;
        margin-right: 4px;
    }
    .totals {
        margin-top: 6px;
        padding: 2px 0;
    }
    .total-row {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        line-height: 1.4;
    }
    .grand-total {
        border-top: 1px solid #374151;
        margin-top: 8px;
        padding-top: 6px;
        font-size: 12px;
        font-weight: 700;
    }
    .footer {
        margin-top: 10px;
        padding: 2px 0;
        text-align: center;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.35;
    }
    .footer-notice {
        font-size: 13px;
        font-weight: 800;
        line-height: 1.25;
    }
    .footer-strong {
        font-weight: 700;
    }
    
    tr, td, th, .meta-line, .total-row, .separator {
        page-break-inside: avoid;
        break-inside: avoid;
    }

    @media print {
        @page {
            size: var(--receipt-paper-width) auto;
            margin: 0;
        }
        html, body {
            width: var(--receipt-paper-width);
            margin: 0;
            padding: 0;
            display: block;
        }
        .receipt {
            width: 100%;
            max-width: none;
            margin: 0;
            box-sizing: border-box;
            padding: 2mm var(--receipt-inline-padding);
        }
    }
</style>
            </head>
            <body>
                <div class="receipt">
                    <h1 class="title">${escapeHtml(receipt.businessName)}</h1>
                    <div class="sub">${escapeHtml(receipt.businessAddress)}</div>
                    ${orderHeader}
                    <div class="sub tin-line">TIN: ${escapeHtml(receipt.businessTin)}</div>

                    <div class="separator"></div>

                    <div class="print-block">
                        <div class="meta-line"><span>Receipt #:</span><span>${escapeHtml(receipt.displayId)}</span></div>
                        <div class="meta-line"><span>Date:</span><span>${escapeHtml(receipt.date)}</span></div>
                        <div class="meta-line"><span>Time:</span><span>${escapeHtml(receipt.time)}</span></div>
                        <div class="meta-line"><span>Cashier:</span><span>${escapeHtml(receipt.cashierName)}</span></div>
                        <div class="meta-line"><span>Order Type:</span><span>${escapeHtml(receipt.orderType)}</span></div>
                        <div class="meta-line"><span>Payment:</span><span>${escapeHtml(receipt.paymentMethod)}</span></div>
                    </div>

                    <div class="separator"></div>

                    <div class="print-block">
                        <table>
                            <thead>
                                <tr>
                                    <th class="qty">Qty</th>
                                    <th>Item</th>
                                    <th class="amount">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>

                    <div class="separator"></div>

                    <div class="totals">
                        <div class="total-row">
                            <span>Subtotal</span>
                            <span>${formatMoney(receipt.grossTotal)}</span>
                        </div>
                        ${discountRow}
                        <div class="total-row">
                            <span>VAT (12%)</span>
                            <span>${formatMoney(receipt.vatAmount)}</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>Total</span>
                            <span>${formatMoney(receipt.netTotal)}</span>
                        </div>
                        <div class="total-row">
                            <span>Cash</span>
                            <span>${formatMoney(receipt.paidAmount)}</span>
                        </div>
                        <div class="total-row">
                            <span>Change</span>
                            <span>${formatMoney(receipt.changeAmount)}</span>
                        </div>
                    </div>

                    <div class="footer">
                        <div class="footer-notice">System-Generated Receipt</div>
                        <div>${escapeHtml(receipt.businessContact)}</div>
                        ${footerMessage}
                        <div class="footer-notice">Not an official receipt</div>
                    </div>
                </div>
            </body>
        </html>
    `;
};
