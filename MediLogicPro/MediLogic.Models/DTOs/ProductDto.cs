namespace MediLogic.Models.DTOs
{
    public class ProductDto
    {
        public int ProductId { get; set; }
        public string? ProductCode { get; set; }
        public string ProductName { get; set; } = null!;
        public string? GenericName { get; set; }
        public string? Strength { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int? UomId { get; set; }
        public string? UomName { get; set; }
        public int? TaxId { get; set; }
        public string? TaxName { get; set; }
        public decimal? PurchasePrice { get; set; }
        public decimal? SalePrice { get; set; }
    }
}
