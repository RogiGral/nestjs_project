export const HTML_INVOICE_TEMPLATE = (invoice: any): string => `
<html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        .invoice-box {
            padding: 30px;
            margin: 20px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        }

        .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
        }

        .invoice-box table td {
            padding: 5px;
            vertical-align: top;
        }

        .invoice-box table tr td:nth-child(2) {
            text-align: right;
        }

        .invoice-box table tr.top table td {
            padding-bottom: 20px;
        }

        .invoice-box table tr.information table td {
            float: right;
            padding-bottom: 40px;
        }

        .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
        }

        .invoice-box table tr.details td {
            padding-bottom: 20px;
        }

        .invoice-box table tr.item td {
            border-bottom: 1px solid #bbb;
        }

        .invoice-box table tr.item.last td {
            border-bottom: none;
        }

        .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="invoice-box">
        <table>
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title">
                                <h2>Invoice</h2>
                            </td>
                            <td>
                                ${new Date(invoice.date).toDateString()}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr class="information">
                <td colspan="6">
                    <table>
                        <tr>
                            <td>
                                <strong>Consumer:</strong><br>
                                ${invoice.consumer.name}<br>
                                ${invoice.consumer.email}<br>
                                ${invoice.company.tin_number ? 'NIP: ' + invoice.company.tin_number + '<br>' : ''}
                                ${invoice.consumer.phoneNumber ? invoice.consumer.phoneNumber + '<br>' : ''}
                                ${invoice.consumer.address.line1}, ${invoice.consumer.address.line2 ? invoice.consumer.address.line2 + ',' : ''} 
                                ${invoice.consumer.address.state ? invoice.consumer.address.state + ',' : ''} <br>
                                ${invoice.consumer.address.postal_code}, ${invoice.consumer.address.city}, ${invoice.consumer.address.country}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            </br>
            <tr class="heading">
                <td>Item</td>
                <td>Unit Price</td>
                <td>Quantity</td>
                <td>Total</td>
                <td>Tax Value</td>
                <td>Currency</td>
            </tr>
            ${invoice.lineItems.map((item: any) => `
            <tr class="item">
                <td>${item.name}</td>
                <td>$${(item.amount_unit / 100).toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${(item.amount_total / 100).toFixed(2)}</td>
                <td>$${item.tax_value}</td>
                <td>${item.currency.toUpperCase()}</td>
            </tr>
            `).join('')}
            <tr class="total">
                <td colspan="4"></td>
                <td colspan="2">
                    Final Amount: $${(invoice.finalAmount / 100).toFixed(2)}
                </td>
            </tr>
        </table>
    </div>
</body>

</html>
`;
