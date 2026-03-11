using Lorekeeper.World.Application.Interfaces;
using Lorekeeper.World.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using WorldEntity = Lorekeeper.World.Domain.Entities.World;

namespace Lorekeeper.World.Infrastructure.Repositories
{
    public class WorldRepository : IWorldRepository
    {
        private readonly WorldDbContext _context;

        public WorldRepository(WorldDbContext context)
        {
            _context = context;
        }

        public async Task<WorldEntity> GetWorldByIdAsync(Guid id)
        {
            return await _context.Worlds.FindAsync(id);
        }

        public async Task<WorldEntity> CreateWorldAsync(WorldEntity world)
        {
            _context.Worlds.Add(world);
            await _context.SaveChangesAsync();
            return world;
        }

        public async Task<bool> UpdateWorldAsync(WorldEntity world)
        {
            _context.Worlds.Update(world);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteWorldAsync(Guid id)
        {
            var entity = await _context.Worlds.FindAsync(id);
            if (entity == null) return false;
            _context.Worlds.Remove(entity);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> WorldExistsAsync(Guid id)
        {
            return await _context.Worlds.AnyAsync(w => w.Id == id);
        }

        public async Task<List<WorldEntity>> GetAllWorldsAsync(Guid userId)
        {
            return await _context.Worlds
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }
    }
}