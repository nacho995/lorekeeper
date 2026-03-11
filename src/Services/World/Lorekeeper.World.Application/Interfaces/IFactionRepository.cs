using Lorekeeper.World.Domain.Entities;

namespace Lorekeeper.World.Application.Interfaces
{
    public interface IFactionRepository
    {
        Task<Faction> GetFactionByIdAsync(Guid id);
        Task<Faction> CreateFactionAsync(Faction faction);
        Task<bool> UpdateFactionAsync(Faction faction);
        Task<bool> DeleteFactionAsync(Guid id);
        Task<bool> FactionExistsAsync(Guid id);
        Task<List<Faction>> GetAllFactionsAsync(Guid worldId);
    }
}