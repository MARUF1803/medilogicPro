using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MediLogic.Models;
using MediLogic.Security.Interfaces;
using System;
using System.Collections.Generic;

namespace MediLogic.Security.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateJwtToken(User user, List<string> roles)
    {
        // ১. টোকেনের ভেতরে কী কী তথ্য (Claims) থাকবে তা ডিফাইন করা
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // টোকেনের ইউনিক আইডি
        };

        // ইউজারের রোলগুলো অ্যাড করা (Role-based Authorization এর জন্য)
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        // ২. সিক্রেট কি (Key) জেনারেট করা (appsettings.json থেকে আসবে)
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // ৩. টোকেনের বডি এবং মেয়াদ সেট করা
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(Convert.ToDouble(_config["Jwt:DurationInMinutes"])),
            signingCredentials: creds
        );

        // ৪. টোকেনটাকে স্ট্রিং ফরম্যাটে কনভার্ট করে রিটার্ন করা
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}