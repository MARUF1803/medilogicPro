namespace MediLogic.Security.DTOs;

public class UserRegisterDto
{
    public string FullName { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!; // User will provide the password in this field
    public string UserType { get; set; } = null!;
    public int? BranchId { get; set; }
}