using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class AssignRole
{
    public int AssignRoleId { get; set; }

    public int? UserId { get; set; }

    public int? RoleId { get; set; }

    public DateTime? AssignedDate { get; set; }

    public bool? IsActive { get; set; }

    public virtual Role? Role { get; set; }

    public virtual User? User { get; set; }
}
