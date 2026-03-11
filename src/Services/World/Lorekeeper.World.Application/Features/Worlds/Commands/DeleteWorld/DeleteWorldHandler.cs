using MediatR;
using Lorekeeper.World.Application.Interfaces;

namespace Lorekeeper.World.Application.Features.Worlds.Commands.DeleteWorld
{
    public class DeleteWorldHandler : IRequestHandler<DeleteWorldCommand, bool>
    {
        private readonly IWorldRepository _worldRepository;

        public DeleteWorldHandler(IWorldRepository worldRepository)
        {
            _worldRepository = worldRepository;
        }

        public async Task<bool> Handle(DeleteWorldCommand request, CancellationToken cancellationToken)
        {
            return await _worldRepository.DeleteWorldAsync(request.Id);
        }
    }
}
