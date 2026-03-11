namespace Lorekeeper.World.Application.DTOs
{
    public class FactionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid WorldId { get; set; }
        public string WorldName { get; set; }
    }
}