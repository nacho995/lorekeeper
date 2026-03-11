using WorldEntity = Lorekeeper.World.Domain.Entities.World;

namespace Lorekeeper.World.Application.Interfaces
{
    public interface IWorldRepository
    {
        Task<WorldEntity> GetWorldByIdAsync(Guid id);
        Task<WorldEntity> CreateWorldAsync(WorldEntity world);
        Task<bool> UpdateWorldAsync(WorldEntity world);
        Task<bool> DeleteWorldAsync(Guid id);
        Task<bool> WorldExistsAsync(Guid id);
        Task<List<WorldEntity>> GetAllWorldsAsync(Guid userId);
    }
}