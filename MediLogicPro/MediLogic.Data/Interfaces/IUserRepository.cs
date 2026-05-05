using MediLogic.Data.Interfaces;
using MediLogic.Models;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByUserNameAsync(string userName);
    Task<User?> GetByUserNameWithRolesAsync(string userName);
    Task<Role?> GetRoleByNameAsync(string roleName);
    Task<IEnumerable<Role>> GetAllRolesAsync();
    Task AddRoleAsync(Role role);
    Task AddAssignRoleAsync(AssignRole assignRole);
    Task DeleteRoleAsync(int id);
}