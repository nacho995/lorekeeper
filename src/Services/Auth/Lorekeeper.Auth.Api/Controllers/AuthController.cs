using Microsoft.AspNetCore.Mvc;
using MediatR;
using Lorekeeper.Auth.Application.Features.Auth.Commands.Register;
using Lorekeeper.Auth.Application.Features.Auth.Commands.Login;
using Lorekeeper.Auth.Application.DTOs;
namespace Lorekeeper.Auth.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterCommand command)
        {
            try
            {
                return Ok(await _mediator.Send(command));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            try
            {
                return Ok(await _mediator.Send(command));
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Credenciales incorrectas" });
            }
        }
    }
}