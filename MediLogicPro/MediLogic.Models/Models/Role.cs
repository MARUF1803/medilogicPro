using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class Role
{
    public int RoleId { get; set; }

    public string RoleName { get; set; } = null!;

    public virtual ICollection<AssignRole> AssignRoles { get; set; } = new List<AssignRole>();
}
