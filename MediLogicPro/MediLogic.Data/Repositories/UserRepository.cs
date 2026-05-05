using MediLogic.Data;
using MediLogic.Data.Repositories;
using MediLogic.Models;
using Microsoft.EntityFrameworkCore;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context) { }

    public async Task<User?> GetByUserNameAsync(string userName)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.UserName == userName && u.IsDeleted != true);
    }

    public async Task<User?> GetByUserNameWithRolesAsync(string userName)
    {
        return await _dbSet
            .Include(u => u.AssignRoles)
                .ThenInclude(ar => ar.Role)
            .FirstOrDefaultAsync(u => u.UserName == userName && u.IsDeleted != true);
    }

    public async Task<Role?> GetRoleByNameAsync(string roleName)
    {
        return await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
    }

    public async Task<IEnumerable<Role>> GetAllRolesAsync()
    {
        return await _context.Roles.ToListAsync();
    }

    public async Task AddRoleAsync(Role role)
    {
        await _context.Roles.AddAsync(role);
    }

    public async Task AddAssignRoleAsync(AssignRole assignRole)
    {
        await _context.AssignRoles.AddAsync(assignRole);
    }

    public async Task DeleteRoleAsync(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role != null)
        {
            _context.Roles.Remove(role);
        }
    }
}