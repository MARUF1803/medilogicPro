using MediLogic.Models;

namespace MediLogic.Logic.Services;

public interface IUserService
{
    Task<User> RegisterUserAsync(User user, string plainPassword);
    Task<IEnumerable<User>> GetAllUsersAsync();
}