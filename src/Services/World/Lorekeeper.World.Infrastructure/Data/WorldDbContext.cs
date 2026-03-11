using Lorekeeper.World.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using WorldEntity = Lorekeeper.World.Domain.Entities.World;

namespace Lorekeeper.World.Infrastructure.Data
{
    public class WorldDbContext : DbContext
    {
        public WorldDbContext(DbContextOptions<WorldDbContext> options)
            : base(options) { }

        public DbSet<WorldEntity> Worlds { get; set; }
        public DbSet<Character> Characters { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Faction> Factions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<WorldEntity>().HasKey(w => w.Id);
            modelBuilder.Entity<WorldEntity>().Property(w => w.Name).IsRequired();
            modelBuilder.Entity<WorldEntity>().Property(w => w.Description).HasDefaultValue(string.Empty);
            modelBuilder.Entity<WorldEntity>().Property(w => w.Image).HasDefaultValue(string.Empty);
            modelBuilder.Entity<WorldEntity>().Property(w => w.CreatedAt).HasDefaultValue(DateTime.UtcNow);
            modelBuilder.Entity<WorldEntity>().Property(w => w.UpdatedAt).HasDefaultValue(DateTime.UtcNow);
            modelBuilder.Entity<WorldEntity>().Property(w => w.UserId).IsRequired();
            modelBuilder.Entity<WorldEntity>().HasMany(w => w.Characters).WithOne(c => c.World).HasForeignKey(c => c.WorldId);
            modelBuilder.Entity<WorldEntity>().HasMany(w => w.Locations).WithOne(l => l.World).HasForeignKey(l => l.WorldId);
            modelBuilder.Entity<WorldEntity>().HasMany(w => w.Factions).WithOne(f => f.World).HasForeignKey(f => f.WorldId);
        }
    }
}