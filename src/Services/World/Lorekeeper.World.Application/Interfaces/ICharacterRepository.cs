using Lorekeeper.World.Domain.Entities;

namespace Lorekeeper.World.Application.Interfaces
{
    public interface ICharacterRepository
    {
        Task<Character> GetCharacterByIdAsync(Guid id);
        Task<Character> CreateCharacterAsync(Character character);
        Task<bool> UpdateCharacterAsync(Character character);
        Task<bool> DeleteCharacterAsync(Guid id);
        Task<bool> CharacterExistsAsync(Guid id);
        Task<List<Character>> GetAllCharactersAsync(Guid worldId);
    }
}