
namespace Lorekeeper.World.Domain.Entities
{
    public class World
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid UserId { get; set; }
        public List<Character> Characters { get; set; } = new();
        public List<Location> Locations { get; set; } = new();
        public List<Faction> Factions { get; set; } = new();
    }
}