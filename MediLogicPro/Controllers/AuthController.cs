using Microsoft.AspNetCore.Mvc;
using MediLogic.Security.DTOs;
using MediLogic.Security.Interfaces;
using MediLogic.Security.Services;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace MediLogicPro.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ITokenService _tokenService;

    public AuthController(AuthService authService, ITokenService tokenService)
    {
        _authService = authService;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        // 1. Verify credentials using AuthService
        var user = await _authService.VerifyUserAsync(loginDto.UserName, loginDto.Password);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        // 2. Fetch user roles from the navigation property
        var roles = user.AssignRoles
            .Where(ar => ar.Role != null)
            .Select(ar => ar.Role!.RoleName)
            .ToList();

        // 3. Generate JWT Token using TokenService
        var token = _tokenService.GenerateJwtToken(user, roles);

        // 4. Return the token and basic user info
        return Ok(new
        {
            Token = token,
            UserName = user.UserName,
            Roles = roles
        });
    }
}