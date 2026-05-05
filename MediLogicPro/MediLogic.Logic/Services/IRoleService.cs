using MediLogic.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MediLogic.Logic.Services;

public interface IRoleService
{
    Task<IEnumerable<Role>> GetAllRolesAsync();
    Task CreateRoleAsync(Role role);
    Task DeleteRoleAsync(int id);
}
