public class ContentItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? ExternalId { get; set; } // Наприклад, Telegram Message ID але побачимо
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}