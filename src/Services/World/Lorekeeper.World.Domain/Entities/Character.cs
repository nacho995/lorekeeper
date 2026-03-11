namespace Lorekeeper.World.Domain.Entities
{
    public class Character
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? Image { get; set; }
        public string? Title { get; set; }
        public string? Race { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid WorldId { get; set; }
        public World World { get; set; }
    }
}
