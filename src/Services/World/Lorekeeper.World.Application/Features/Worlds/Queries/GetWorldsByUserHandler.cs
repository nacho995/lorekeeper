using Lorekeeper.World.Application.DTOs;
using Lorekeeper.World.Application.Interfaces;
using MediatR;

namespace Lorekeeper.World.Application.Features.Worlds.Queries
{
    public class GetWorldsByUserHandler : IRequestHandler<GetWorldsByUserQuery, List<WorldDto>>
    {
        private readonly IWorldRepository _worldRepository;

        public GetWorldsByUserHandler(IWorldRepository worldRepository)
        {
            _worldRepository = worldRepository;
        }

        public async Task<List<WorldDto>> Handle(
            GetWorldsByUserQuery request,
            CancellationToken cancellationToken
        )
        {
            var worlds = await _worldRepository.GetAllWorldsAsync(request.UserId);
            return worlds
                .Select(w => new WorldDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Description = w.Description,
                    Image = w.Image,
                    CreatedAt = w.CreatedAt,
                    UpdatedAt = w.UpdatedAt,
                    UserId = w.UserId,
                })
                .ToList();
        }
    }
}
