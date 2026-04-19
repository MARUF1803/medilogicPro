using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class ProductMaster
{
    public int Id { get; set; }

    public int? ProductId { get; set; }

    public int? BranchId { get; set; }

    public decimal? OpeningQuantity { get; set; }

    public decimal? OpeningValue { get; set; }

    public DateOnly? OpeningDate { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual Product? Product { get; set; }
}
