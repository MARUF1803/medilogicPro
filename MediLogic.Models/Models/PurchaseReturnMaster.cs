using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class PurchaseReturnMaster
{
    public int PurchaseReturnId { get; set; }

    public string? ReturnNo { get; set; }

    public int? PurchaseId { get; set; }

    public int? SupplierId { get; set; }

    public int? BranchId { get; set; }

    public DateTime? ReturnDate { get; set; }

    public decimal? TotalReturnAmount { get; set; }

    public string? Reason { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual PurchaseMaster? Purchase { get; set; }

    public virtual ICollection<PurchaseReturnDetail> PurchaseReturnDetails { get; set; } = new List<PurchaseReturnDetail>();

    public virtual Party? Supplier { get; set; }
}
