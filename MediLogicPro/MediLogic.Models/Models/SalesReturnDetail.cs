using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class SalesReturnDetail
{
    public int Id { get; set; }

    public int? SalesReturnId { get; set; }

    public int? ProductId { get; set; }

    public string? BatchNumber { get; set; }

    public decimal Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public virtual Product? Product { get; set; }

    public virtual SalesReturnMaster? SalesReturn { get; set; }
}
