using MediLogic.Data.Interfaces;
using MediLogic.Models;
using System.Threading.Tasks;

namespace MediLogic.Security.Services;

public class AuthService
{
    private readonly IUserRepository _userRepo;

    public AuthService(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<User?> VerifyUserAsync(string userName, string password)
    {
        // Retrieve user from database along with their roles
        var user = await _userRepo.GetByUserNameWithRolesAsync(userName);

        if (user == null) return null;
        if (string.IsNullOrEmpty(password)) return null;

        // Verify password using BCrypt
        bool isValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

        return isValid ? user : null;
    }
}