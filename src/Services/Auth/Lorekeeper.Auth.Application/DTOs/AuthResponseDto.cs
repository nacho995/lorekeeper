namespace Lorekeeper.Auth.Application.DTOs
{
    public class AuthResponseDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
        public string AccessToken { get; set; }
        public DateTime Expiration { get; set; }
    }
}
