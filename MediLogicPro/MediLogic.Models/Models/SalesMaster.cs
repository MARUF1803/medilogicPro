using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class SalesMaster
{
    public int SalesId { get; set; }

    public string? InvoiceNo { get; set; }

    public int? BranchId { get; set; }

    public int? UserId { get; set; }

    public int? PartyId { get; set; }

    public decimal? TotalAmount { get; set; }

    public decimal? Discount { get; set; }

    public decimal? NetAmount { get; set; }

    public DateTime? SalesDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentReference { get; set; }
    public string? PaymentProvider { get; set; }
    public string? PaymentStatus { get; set; } = "Paid"; // Paid, Pending, Failed
    public string? PaymentMode { get; set; } = "Manual"; // Manual, API
    public decimal? ChangeAmount { get; set; }
    public string? PrescriptionFilePath { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual Party? Party { get; set; }

    public virtual ICollection<SalesDetail> SalesDetails { get; set; } = new List<SalesDetail>();

    public virtual ICollection<SalesPayment> SalesPayments { get; set; } = new List<SalesPayment>();

    public virtual ICollection<SalesReturnMaster> SalesReturnMasters { get; set; } = new List<SalesReturnMaster>();

    public virtual User? User { get; set; }
}
