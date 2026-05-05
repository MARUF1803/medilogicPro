using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class Branch
{
    public int BranchId { get; set; }

    public int? CompanyId { get; set; }

    public string? BranchCode { get; set; }

    public string BranchName { get; set; } = null!;

    public string? Address { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? AddedDate { get; set; }

    public virtual ICollection<BatchStock> BatchStocks { get; set; } = new List<BatchStock>();
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual Company? Company { get; set; }

    public virtual ICollection<Party> Parties { get; set; } = new List<Party>();

    public virtual ICollection<ProductMaster> ProductMasters { get; set; } = new List<ProductMaster>();

    public virtual ICollection<PurchaseMaster> PurchaseMasters { get; set; } = new List<PurchaseMaster>();

    public virtual ICollection<PurchaseReturnMaster> PurchaseReturnMasters { get; set; } = new List<PurchaseReturnMaster>();

    public virtual ICollection<SalesMaster> SalesMasters { get; set; } = new List<SalesMaster>();

    public virtual ICollection<SalesReturnMaster> SalesReturnMasters { get; set; } = new List<SalesReturnMaster>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();

    public virtual ICollection<Ledger> Ledgers { get; set; } = new List<Ledger>();
}
