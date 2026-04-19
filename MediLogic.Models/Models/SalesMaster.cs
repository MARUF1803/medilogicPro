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

    public virtual Branch? Branch { get; set; }

    public virtual Party? Party { get; set; }

    public virtual ICollection<SalesDetail> SalesDetails { get; set; } = new List<SalesDetail>();

    public virtual ICollection<SalesReturnMaster> SalesReturnMasters { get; set; } = new List<SalesReturnMaster>();

    public virtual User? User { get; set; }
}
