using Lorekeeper.World.Application.DTOs;
using Lorekeeper.World.Application.Interfaces;
using MediatR;
using WorldEntity = Lorekeeper.World.Domain.Entities.World;

namespace Lorekeeper.World.Application.Features.Worlds.Commands.CreateWorld
{
    public class CreateWorldHandler : IRequestHandler<CreateWorldCommand, WorldDto>
    {
        private readonly IWorldRepository _worldRepository;

        public CreateWorldHandler(IWorldRepository worldRepository)
        {
            _worldRepository = worldRepository;
        }

        public async Task<WorldDto> Handle(
            CreateWorldCommand request,
            CancellationToken cancellationToken
        )
        {
            var world = new WorldEntity
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Image = request.Image,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = request.UserId,
            };
            await _worldRepository.CreateWorldAsync(world);
            return new WorldDto
            {
                Id = world.Id,
                Name = world.Name,
                Description = world.Description,
                Image = world.Image,
                CreatedAt = world.CreatedAt,
                UpdatedAt = world.UpdatedAt,
                UserId = world.UserId,
            };
        }
    }
}
