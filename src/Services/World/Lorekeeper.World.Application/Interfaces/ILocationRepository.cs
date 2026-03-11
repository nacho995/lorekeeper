using Lorekeeper.World.Domain.Entities;

namespace Lorekeeper.World.Application.Interfaces
{
    public interface ILocationRepository
    {
        Task<Location> GetLocationByIdAsync(Guid id);
        Task<Location> CreateLocationAsync(Location location);
        Task<bool> UpdateLocationAsync(Location location);
        Task<bool> DeleteLocationAsync(Guid id);
        Task<bool> LocationExistsAsync(Guid id);
        Task<List<Location>> GetAllLocationsAsync(Guid worldId);
    }
}