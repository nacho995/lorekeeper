using Microsoft.AspNetCore.Mvc;
using MediatR;
using Lorekeeper.World.Application.Features.Worlds.Queries;
using Lorekeeper.World.Application.Features.Worlds.Commands.CreateWorld;
using Lorekeeper.World.Application.Features.Worlds.Commands.DeleteWorld;

namespace Lorekeeper.World.Api.Controllers
{
    [ApiController]
    [Route("api/worlds")]
    public class WorldsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public WorldsController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet]
        public async Task<IActionResult> GetWorlds([FromQuery] Guid userId)
        {
            return Ok(await _mediator.Send(new GetWorldsByUserQuery { UserId = userId }));
        }
        [HttpPost]
        public async Task<IActionResult> CreateWorld([FromBody] CreateWorldCommand command)
        {
            return Ok(await _mediator.Send(command));
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteWorld(Guid id)
        {
            var deleted = await _mediator.Send(new DeleteWorldCommand { Id = id });
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
