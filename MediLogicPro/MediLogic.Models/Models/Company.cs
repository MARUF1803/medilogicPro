using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class Company
{
    public int CompanyId { get; set; }

    public string? CompanyCode { get; set; }

    public string CompanyName { get; set; } = null!;

    public string? Address { get; set; }

    public string? RegistrationNumber { get; set; }

    public DateTime? CreatedDate { get; set; }

    public virtual ICollection<Branch> Branches { get; set; } = new List<Branch>();
}
