public class LocationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Image { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid WorldId { get; set; }
    public string WorldName { get; set; }
}