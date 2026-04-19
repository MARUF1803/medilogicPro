using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class Party
{
    public int PartyId { get; set; }

    public string? PartyCode { get; set; }

    public string FullName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string? Email { get; set; }

    public string PartyType { get; set; } = null!;

    public int? BranchId { get; set; }

    public decimal? CurrentBalance { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual ICollection<PurchaseMaster> PurchaseMasters { get; set; } = new List<PurchaseMaster>();

    public virtual ICollection<PurchaseReturnMaster> PurchaseReturnMasters { get; set; } = new List<PurchaseReturnMaster>();

    public virtual ICollection<SalesMaster> SalesMasters { get; set; } = new List<SalesMaster>();
}
