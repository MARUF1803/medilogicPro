using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class SalesDetail
{
    public int DetailId { get; set; }

    public int? SalesId { get; set; }

    public int? ProductId { get; set; }

    public string? BatchNumber { get; set; }

    public decimal? Quantity { get; set; }

    public decimal? UnitPrice { get; set; }

    public decimal? PurchasePriceAtTime { get; set; }

    public virtual Product? Product { get; set; }

    public virtual SalesMaster? Sales { get; set; }
}
