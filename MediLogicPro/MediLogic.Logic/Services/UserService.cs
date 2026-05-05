using BCrypt.Net;
using MediLogic.Models;
using MediLogic.Data.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MediLogic.Logic.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepo;

    public UserService(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<User> RegisterUserAsync(User user, string plainPassword)
    {
        // 1. Check if the username already exists
        var existingUser = await _userRepo.GetByUserNameAsync(user.UserName);
        if (existingUser != null)
            throw new Exception("Username already exists!");

        // 2. Hash the password and set default metadata
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(plainPassword);
        user.CreatedAt = DateTime.Now;
        user.IsActive = true;

        // 3. Save User to the database (Generates UserId)
        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        // 4. Role Management: Check if the role exists, create it if it doesn't
        var roleName = string.IsNullOrEmpty(user.UserType) ? "User" : user.UserType;
        var role = await _userRepo.GetRoleByNameAsync(roleName);

        if (role == null)
        {
            role = new Role { RoleName = roleName };
            await _userRepo.AddRoleAsync(role);
            await _userRepo.SaveChangesAsync();
        }

        // 5. Create User-Role Assignment (Linking User and Role)
        var assignRole = new AssignRole
        {
            UserId = user.UserId,
            RoleId = role.RoleId,
            AssignedDate = DateTime.Now,
            IsActive = true
        };

        await _userRepo.AddAssignRoleAsync(assignRole);
        await _userRepo.SaveChangesAsync();

        return user;
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        // Fetch all users from the repository
        return await _userRepo.GetAllAsync();
    }
}