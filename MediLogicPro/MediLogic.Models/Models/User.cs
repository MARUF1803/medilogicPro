using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class User
{
    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string UserName { get; set; } = null!;

    public string? Email { get; set; }

    public string PasswordHash { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public string UserType { get; set; } = null!;

    public int? BranchId { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<AssignRole> AssignRoles { get; set; } = new List<AssignRole>();

    public virtual Branch? Branch { get; set; }

    public virtual ICollection<SalesMaster> SalesMasters { get; set; } = new List<SalesMaster>();

    public virtual ICollection<UserRefreshToken> UserRefreshTokens { get; set; } = new List<UserRefreshToken>();
}
