using MediLogic.Data.Interfaces;
using MediLogic.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MediLogic.Logic.Services;

public class RoleService : IRoleService
{
    private readonly IUserRepository _userRepository;

    public RoleService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<Role>> GetAllRolesAsync()
    {
        return await _userRepository.GetAllRolesAsync();
    }

    public async Task CreateRoleAsync(Role role)
    {
        await _userRepository.AddRoleAsync(role);
        await _userRepository.SaveChangesAsync();
    }

    public async Task DeleteRoleAsync(int id)
    {
        await _userRepository.DeleteRoleAsync(id);
        await _userRepository.SaveChangesAsync();
    }
}
