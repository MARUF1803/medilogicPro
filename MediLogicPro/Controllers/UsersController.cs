using MediLogic.Logic.Services;
using MediLogic.Models;
using MediLogic.Security.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MediLogicPro.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("Register")]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
    {
        // Validate incoming data
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            // Map DTO to User Model
            var user = new User
            {
                FullName = dto.FullName,
                UserName = dto.UserName,
                Email = dto.Email,
                UserType = dto.UserType, // Admin, Manager, or Salesman
                BranchId = dto.BranchId
            };

            // Call Service to handle Hashing, Saving User, and Assigning Roles
            var result = await _userService.RegisterUserAsync(user, dto.Password);

            return Ok(new
            {
                message = "Registration successful with role assigned",
                username = result.UserName,
                role = result.UserType
            });
        }
        catch (Exception ex)
        {
            // Handle duplicate username or other logic errors
            return Conflict(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("all-users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var data = await _userService.GetAllUsersAsync();
        return Ok(data);
    }
}