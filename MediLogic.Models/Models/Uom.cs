using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class Uom
{
    public int UomId { get; set; }

    public string UomName { get; set; } = null!;

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
