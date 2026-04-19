using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class Product
{
    public int ProductId { get; set; }

    public string? ProductCode { get; set; }

    public string ProductName { get; set; } = null!;

    public string? GenericName { get; set; }

    public string? Strength { get; set; }

    public int? CategoryId { get; set; }

    public int? UomId { get; set; }

    public int? TaxId { get; set; }

    public decimal? PurchasePrice { get; set; }

    public decimal? SalePrice { get; set; }

    public bool? IsDeleted { get; set; }

    public virtual ICollection<BatchStock> BatchStocks { get; set; } = new List<BatchStock>();

    public virtual Category? Category { get; set; }

    public virtual ICollection<ProductMaster> ProductMasters { get; set; } = new List<ProductMaster>();

    public virtual ICollection<PurchaseDetail> PurchaseDetails { get; set; } = new List<PurchaseDetail>();

    public virtual ICollection<PurchaseReturnDetail> PurchaseReturnDetails { get; set; } = new List<PurchaseReturnDetail>();

    public virtual ICollection<SalesDetail> SalesDetails { get; set; } = new List<SalesDetail>();

    public virtual ICollection<SalesReturnDetail> SalesReturnDetails { get; set; } = new List<SalesReturnDetail>();

    public virtual Tax? Tax { get; set; }

    public virtual Uom? Uom { get; set; }
}
