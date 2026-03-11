using Lorekeeper.Auth.Application.DTOs;
using MediatR;

namespace Lorekeeper.Auth.Application.Features.Auth.Commands.Login
{
    public class LoginCommand : IRequest<AuthResponseDto>
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}