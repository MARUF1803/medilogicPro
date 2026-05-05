using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class PurchaseMaster
{
    public int PurchaseId { get; set; }

    public string? PurchaseNo { get; set; }

    public int? SupplierId { get; set; }

    public int? BranchId { get; set; }

    public decimal TotalAmount { get; set; }
    public decimal? Discount { get; set; }
    public decimal? NetAmount { get; set; }

    public DateTime? PurchaseDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentReference { get; set; }
    public string? PaymentProvider { get; set; }
    public decimal? ChangeAmount { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual ICollection<PurchaseDetail> PurchaseDetails { get; set; } = new List<PurchaseDetail>();

    public virtual ICollection<PurchaseReturnMaster> PurchaseReturnMasters { get; set; } = new List<PurchaseReturnMaster>();
    public virtual ICollection<PurchasePayment> PurchasePayments { get; set; } = new List<PurchasePayment>();

    public virtual Party? Supplier { get; set; }
}
