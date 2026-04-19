using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class SalesReturnMaster
{
    public int SalesReturnId { get; set; }

    public string? ReturnNo { get; set; }

    public int? SalesId { get; set; }

    public int? BranchId { get; set; }

    public DateTime? ReturnDate { get; set; }

    public decimal? TotalRefundAmount { get; set; }

    public string? Reason { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual SalesMaster? Sales { get; set; }

    public virtual ICollection<SalesReturnDetail> SalesReturnDetails { get; set; } = new List<SalesReturnDetail>();
}
