using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class PurchaseDetail
{
    public int Id { get; set; }

    public int? PurchaseId { get; set; }

    public int? ProductId { get; set; }

    public string? BatchNumber { get; set; }

    public decimal Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public DateOnly? ExpiryDate { get; set; }
    public decimal? ReturnedQuantity { get; set; }

    public virtual Product? Product { get; set; }

    public virtual PurchaseMaster? Purchase { get; set; }
}
