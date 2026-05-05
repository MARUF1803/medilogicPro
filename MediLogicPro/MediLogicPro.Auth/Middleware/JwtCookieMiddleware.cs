using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace MediLogicPro.Auth.Middleware
{
    public class JwtCookieMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtCookieMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Extract token from HttpOnly cookie
            var token = context.Request.Cookies["JwtToken"];

            if (!string.IsNullOrEmpty(token))
            {
                // Add token to the Authorization header if not already present
                if (!context.Request.Headers.ContainsKey("Authorization"))
                {
                    context.Request.Headers.Append("Authorization", $"Bearer {token}");
                }
            }

            await _next(context);
        }
    }
}
