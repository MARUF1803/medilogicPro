using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class Tax
{
    public int TaxId { get; set; }

    public string? TaxCode { get; set; }

    public string TaxName { get; set; } = null!;

    public decimal? VatRate { get; set; }

    public string? Remarks { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
