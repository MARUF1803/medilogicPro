using MediLogic.Models;
using System.Collections.Generic;

namespace MediLogic.Security.Interfaces;

public interface ITokenService
{
    // ইউজার অবজেক্ট এবং রোলের লিস্ট নিয়ে JWT টোকেন স্ট্রিং জেনারেট করবে
    string GenerateJwtToken(User user, List<string> roles);
}