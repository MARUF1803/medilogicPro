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

    public DateTime? PurchaseDate { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual ICollection<PurchaseDetail> PurchaseDetails { get; set; } = new List<PurchaseDetail>();

    public virtual ICollection<PurchaseReturnMaster> PurchaseReturnMasters { get; set; } = new List<PurchaseReturnMaster>();

    public virtual Party? Supplier { get; set; }
}
