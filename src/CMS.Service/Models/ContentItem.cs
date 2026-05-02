public class ContentItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? ExternalId { get; set; }
    public string? ImageUrl { get; set; } // URL або ключ завантаженого файлу
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
