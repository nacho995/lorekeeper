using Lorekeeper.Auth.Domain.Entities;

namespace Lorekeeper.Auth.Application.Interfaces
{
    public interface IAuthService
    {
        string GenerateToken(User user);
    }
}
