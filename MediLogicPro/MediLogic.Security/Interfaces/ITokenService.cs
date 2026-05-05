using MediLogic.Models;
using System.Collections.Generic;

namespace MediLogic.Security.Interfaces;

public interface ITokenService
{
    // Generates a JWT token string using the User object and a list of roles
    string GenerateJwtToken(User user, List<string> roles);
}