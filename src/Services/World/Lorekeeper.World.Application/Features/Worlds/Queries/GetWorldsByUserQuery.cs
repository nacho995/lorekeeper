using MediatR;
using Lorekeeper.World.Application.DTOs;

namespace Lorekeeper.World.Application.Features.Worlds.Queries
{
    public class GetWorldsByUserQuery : IRequest<List<WorldDto>>
    {
        public Guid UserId { get; set; }
    }
}