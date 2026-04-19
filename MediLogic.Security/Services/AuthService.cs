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
        // ডাটাবেজ থেকে রোলসহ ইউজার নিয়ে আসা
        var user = await _userRepo.GetByUserNameWithRolesAsync(userName);

        if (user == null) return null;

        // পাসওয়ার্ড ভেরিফাই করা (BCrypt ব্যবহার করে)
        bool isValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

        return isValid ? user : null;
    }
}