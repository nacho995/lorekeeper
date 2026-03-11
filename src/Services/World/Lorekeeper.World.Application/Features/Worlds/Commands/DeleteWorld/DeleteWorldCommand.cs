using MediatR;

namespace Lorekeeper.World.Application.Features.Worlds.Commands.DeleteWorld
{
    public class DeleteWorldCommand : IRequest<bool>
    {
        public Guid Id { get; set; }
    }
}
