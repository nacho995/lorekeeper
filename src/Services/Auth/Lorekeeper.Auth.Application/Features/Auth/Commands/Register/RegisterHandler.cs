using MediatR;
using Lorekeeper.Auth.Application.DTOs;
using Lorekeeper.Auth.Application.Interfaces;
using Lorekeeper.Auth.Domain.Entities;
using Lorekeeper.Auth.Domain.Enums;

namespace Lorekeeper.Auth.Application.Features.Auth.Commands.Register
{
    public class RegisterHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IAuthService _authService;

        public RegisterHandler(IUserRepository userRepository, IAuthService authService)
        {
            _userRepository = userRepository;
            _authService = authService;
        }

        public async Task<AuthResponseDto> Handle(
            RegisterCommand request,
            CancellationToken cancellationToken
        )
        {
            var emailExists = await _userRepository.GetUserByEmailAsync(request.Email);
            if (emailExists != null)
            {
                throw new InvalidOperationException("El email ya está registrado");
            }
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Phone = request.Phone,
                Role = Role.Writer,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                Id = Guid.NewGuid(),
            };
            await _userRepository.CreateUserAsync(user);
            var token = _authService.GenerateToken(user);
            return new AuthResponseDto
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}",
                Role = user.Role.ToString(),
                AccessToken = token,
                Expiration = DateTime.UtcNow.AddHours(1),
            };
        }
    }
}
