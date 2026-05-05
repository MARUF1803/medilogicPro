using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MediLogic.Models;

public partial class BatchStock
{
    public int StockId { get; set; }

    public int? ProductId { get; set; }

    public int? BranchId { get; set; }

    public string BatchNumber { get; set; } = null!;

    public DateOnly ExpiryDate { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal Mrp { get; set; }

    public decimal CurrentBalance { get; set; }

    public DateTime? LastUpdated { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual Product? Product { get; set; }

    [Timestamp]
    public byte[]? RowVersion { get; set; }
}
