using Lorekeeper.World.Application.DTOs;
using MediatR;

namespace Lorekeeper.World.Application.Features.Worlds.Commands.CreateWorld
{
    public class CreateWorldCommand : IRequest<WorldDto>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }
        public Guid UserId { get; set; }
    }
}
