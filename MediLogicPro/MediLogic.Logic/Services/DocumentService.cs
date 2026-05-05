using System;
using System.Collections.Generic;
using System.Linq;
using MediLogic.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Previewer;

namespace MediLogic.Logic.Services;

public class DocumentService : IDocumentService
{
    public DocumentService()
    {
        // Set QuestPDF license (Required for newer versions)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateSalesInvoice(SalesMaster sale)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                // --- HEADER ---
                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("MediLogicPRO").FontSize(24).ExtraBold().FontColor("#0c63e4");
                        col.Item().Text("Care Beyond Boundaries").FontSize(10).Italic().FontColor(Colors.Grey.Medium);
                    });

                    row.RelativeItem().Column(col =>
                    {
                        col.Item().AlignRight().Text("SALES INVOICE").FontSize(20).Bold();
                        col.Item().AlignRight().Text($"Invoice #: {sale.InvoiceNo}");
                        col.Item().AlignRight().Text($"Date: {sale.SalesDate:dd-MMM-yyyy}");
                    });
                });

                // --- CONTENT ---
                page.Content().PaddingVertical(1, Unit.Centimetre).Column(column =>
                {
                    // Party Info
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Billed To:").Bold();
                            c.Item().Text(sale.Party?.FullName ?? "Walking Customer");
                            if (sale.Party != null)
                            {
                                c.Item().Text(sale.Party.PhoneNumber ?? "No Phone");
                            }
                        });

                        row.RelativeItem().AlignRight().Column(c =>
                        {
                            c.Item().Text("Branch:").Bold();
                            c.Item().Text(sale.Branch?.BranchName ?? "Main Branch");
                        });
                    });

                    column.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                    // Items Table
                    column.Item().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3); // Product
                            columns.RelativeColumn(1); // Batch
                            columns.RelativeColumn(1); // Qty
                            columns.RelativeColumn(1); // Price
                            columns.RelativeColumn(1); // Total
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(CellStyle).Text("Item / Medicine");
                            header.Cell().Element(CellStyle).Text("Batch");
                            header.Cell().Element(CellStyle).AlignRight().Text("Qty");
                            header.Cell().Element(CellStyle).AlignRight().Text("Rate");
                            header.Cell().Element(CellStyle).AlignRight().Text("Total");

                            static IContainer CellStyle(IContainer container)
                            {
                                return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            }
                        });

                        foreach (var item in sale.SalesDetails)
                        {
                            table.Cell().Element(ItemStyle).Text(item.Product?.ProductName ?? "Unknown Product");
                            table.Cell().Element(ItemStyle).Text(item.BatchNumber);
                            table.Cell().Element(ItemStyle).AlignRight().Text($"{item.Quantity}");
                            table.Cell().Element(ItemStyle).AlignRight().Text($"{item.UnitPrice}");
                            table.Cell().Element(ItemStyle).AlignRight().Text($"{(item.Quantity * item.UnitPrice):N2}");

                            static IContainer ItemStyle(IContainer container) => container.PaddingVertical(5).BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3);
                        }
                    });

                    // Totals
                    column.Item().PaddingTop(10).AlignRight().Column(c =>
                    {
                        c.Item().Text($"Sub Total: {sale.TotalAmount:N2}");
                        c.Item().Text($"Discount: {sale.Discount:N2}");
                        c.Item().PaddingTop(5).Text($"NET AMOUNT: {sale.NetAmount:N2}").FontSize(14).Bold().FontColor("#0c63e4");
                    });
                });

                // --- FOOTER ---
                page.Footer().AlignCenter().Column(c =>
                {
                    c.Item().LineHorizontal(1);
                    c.Item().PaddingTop(5).Text(x =>
                    {
                        x.Span("Software by ");
                        x.Span("Antigravity Systems").SemiBold();
                        x.Span(" - Page ");
                        x.CurrentPageNumber();
                    });
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateSalesReturnMemo(SalesReturnMaster salesReturn)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                // --- HEADER ---
                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("MediLogicPRO").FontSize(24).ExtraBold().FontColor("#0c63e4");
                        col.Item().Text("Care Beyond Boundaries").FontSize(10).Italic().FontColor(Colors.Grey.Medium);
                    });

                    row.RelativeItem().Column(col =>
                    {
                        col.Item().AlignRight().Text("SALES RETURN MEMO").FontSize(20).Bold().FontColor(Colors.Red.Medium);
                        col.Item().AlignRight().Text($"Return #: {salesReturn.ReturnNo}");
                        col.Item().AlignRight().Text($"Date: {salesReturn.ReturnDate:dd-MMM-yyyy}");
                        if (salesReturn.Sales != null)
                        {
                            col.Item().AlignRight().Text($"Ref Invoice: {salesReturn.Sales.InvoiceNo}");
                        }
                    });
                });

                // --- CONTENT ---
                page.Content().PaddingVertical(1, Unit.Centimetre).Column(column =>
                {
                    // Party Info
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Customer:").Bold();
                            c.Item().Text(salesReturn.Sales?.Party?.FullName ?? "Walking Customer");
                        });

                        row.RelativeItem().AlignRight().Column(c =>
                        {
                            c.Item().Text("Branch:").Bold();
                            c.Item().Text(salesReturn.Branch?.BranchName ?? "Main Branch");
                        });
                    });

                    column.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                    if (!string.IsNullOrEmpty(salesReturn.Reason))
                    {
                        column.Item().PaddingTop(5).Text(x => {
                            x.Span("Reason for Return: ").Bold();
                            x.Span(salesReturn.Reason);
                        });
                    }

                    // Items Table
                    column.Item().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3); // Product
                            columns.RelativeColumn(1); // Batch
                            columns.RelativeColumn(1); // Qty
                            columns.RelativeColumn(1); // Price
                            columns.RelativeColumn(1); // Total
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(CellStyle).Text("Item / Medicine");
                            header.Cell().Element(CellStyle).Text("Batch");
                            header.Cell().Element(CellStyle).AlignRight().Text("Qty");
                            header.Cell().Element(CellStyle).AlignRight().Text("Rate");
                            header.Cell().Element(CellStyle).AlignRight().Text("Total");

                            static IContainer CellStyle(IContainer container)
                            {
                                return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            }
                        });

                        foreach (var item in salesReturn.SalesReturnDetails)
                        {
                            table.Cell().Element(ItemStyle).Text(item.Product?.ProductName ?? "Unknown Product");
                            table.Cell().Element(ItemStyle).Text(item.BatchNumber);
                            table.Cell().Element(ItemStyle).AlignRight().Text($"{item.Quantity}");
                            table.Cell().Element(ItemStyle).AlignRight().Text($"{item.UnitPrice}");
                            table.Cell().Element(ItemStyle).AlignRight().Text($"{(item.Quantity * item.UnitPrice):N2}");

                            static IContainer ItemStyle(IContainer container) => container.PaddingVertical(5).BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3);
                        }
                    });

                    // Totals
                    column.Item().PaddingTop(10).AlignRight().Column(c =>
                    {
                        c.Item().PaddingTop(5).Text($"TOTAL REFUND: {salesReturn.TotalRefundAmount:N2}").FontSize(14).Bold().FontColor(Colors.Red.Medium);
                    });
                });

                // --- FOOTER ---
                page.Footer().AlignCenter().Column(c =>
                {
                    c.Item().LineHorizontal(1);
                    c.Item().PaddingTop(5).Text(x =>
                    {
                        x.Span("Software by ");
                        x.Span("Antigravity Systems").SemiBold();
                        x.Span(" - Page ");
                        x.CurrentPageNumber();
                    });
                });
            });
        }).GeneratePdf();
    }

    public byte[] GeneratePurchaseReturnMemo(PurchaseReturnMaster purchaseReturn)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                // --- HEADER ---
                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("MediLogicPRO").FontSize(24).ExtraBold().FontColor("#0c63e4");
                        col.Item().Text("Care Beyond Boundaries").FontSize(10).Italic().FontColor(Colors.Grey.Medium);
                    });

                    row.RelativeItem().Column(col =>
                    {
                        col.Item().AlignRight().Text("PURCHASE RETURN MEMO").FontSize(20).Bold().FontColor(Colors.Orange.Medium);
                        col.Item().AlignRight().Text($"Return #: {purchaseReturn.ReturnNo}");
                        col.Item().AlignRight().Text($"Date: {purchaseReturn.ReturnDate:dd-MMM-yyyy}");
                        if (purchaseReturn.Purchase != null)
                        {
                            col.Item().AlignRight().Text($"Ref Purchase: {purchaseReturn.Purchase.PurchaseNo}");
                        }
                    });
                });

                // --- CONTENT ---
                page.Content().PaddingVertical(1, Unit.Centimetre).Column(column =>
                {
                    // Party Info
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Supplier:").Bold();
                            c.Item().Text(purchaseReturn.Supplier?.FullName ?? "N/A");
                        });

                        row.RelativeItem().AlignRight().Column(c =>
                        {
                            c.Item().Text("Branch:").Bold();
                            c.Item().Text(purchaseReturn.Branch?.BranchName ?? "Main Branch");
                        });
                    });

                    column.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                    if (!string.IsNullOrEmpty(purchaseReturn.Reason))
                    {
                        column.Item().PaddingTop(5).Text(x => {
                            x.Span("Reason for Return: ").Bold();
                            x.Span(purchaseReturn.Reason);
                        });
                    }

                    // Items Table
                    column.Item().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3); // Product
                            columns.RelativeColumn(1); // Batch
                            columns.RelativeColumn(1); // Qty
                            columns.RelativeColumn(1); // Price
                            columns.RelativeColumn(1); // Total
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(CellStyle).Text("Item / Medicine");
                            header.Cell().Element(CellStyle).Text("Batch");
                            header.Cell().Element(CellStyle).AlignRight().Text("Qty");
                            header.Cell().Element(CellStyle).AlignRight().Text("Rate");
                            header.Cell().Element(CellStyle).AlignRight().Text("Total");

                            static IContainer CellStyle(IContainer container)
                            {
                                return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            }
                        });

                        foreach (var item in purchaseReturn.PurchaseReturnDetails)
                        {
                            table.Cell().Element(ItemStyle).Text(item.Product?.ProductName ?? "Unknown Product");
                            table.Cell().Element(ItemStyle).Text(item.BatchNumber);
                            table.Cell().Element(ItemStyle).AlignRight().Text($"{item.Quantity}");
                            table.Cell().Element(ItemStyle).AlignRight().Text($"{item.UnitPrice}");
                            table.Cell().Element(ItemStyle).AlignRight().Text($"{(item.Quantity * item.UnitPrice):N2}");

                            static IContainer ItemStyle(IContainer container) => container.PaddingVertical(5).BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3);
                        }
                    });

                    // Totals
                    column.Item().PaddingTop(10).AlignRight().Column(c =>
                    {
                        c.Item().PaddingTop(5).Text($"TOTAL RETURN VALUE: {purchaseReturn.TotalReturnAmount:N2}").FontSize(14).Bold().FontColor(Colors.Orange.Medium);
                    });
                });

                // --- FOOTER ---
                page.Footer().AlignCenter().Column(c =>
                {
                    c.Item().LineHorizontal(1);
                    c.Item().PaddingTop(5).Text(x =>
                    {
                        x.Span("Software by ");
                        x.Span("Antigravity Systems").SemiBold();
                        x.Span(" - Page ");
                        x.CurrentPageNumber();
                    });
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateStockReport(IEnumerable<BatchStock> stocks)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.Header().Text("Inventory Valuation Report").FontSize(20).Bold().FontColor("#0c63e4");

                page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3); // Product
                        columns.RelativeColumn(1); // Batch
                        columns.RelativeColumn(1); // Expiry
                        columns.RelativeColumn(1); // Stock
                        columns.RelativeColumn(1); // Value (Pur)
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("Product");
                        header.Cell().Text("Batch");
                        header.Cell().Text("Expiry");
                        header.Cell().AlignRight().Text("Qty");
                        header.Cell().AlignRight().Text("Value");
                    });

                    foreach (var stock in stocks)
                    {
                        table.Cell().Text(stock.Product?.ProductName ?? "N/A");
                        table.Cell().Text(stock.BatchNumber);
                        table.Cell().Text(stock.ExpiryDate.ToString("MM/yy"));
                        table.Cell().AlignRight().Text($"{stock.CurrentBalance}");
                        table.Cell().AlignRight().Text($"{(stock.CurrentBalance * stock.PurchasePrice):N2}");
                    }
                });
            });
        }).GeneratePdf();
    }
}
