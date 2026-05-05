using MediLogic.Models;
using MediLogic.Models.DTOs;

namespace MediLogic.Logic.Extensions
{
    public static class ProductExtensions
    {
        public static ProductDto? ToDto(this Product product)
        {
            if (product == null) return null;

            return new ProductDto
            {
                ProductId = product.ProductId,
                ProductCode = product.ProductCode,
                ProductName = product.ProductName,
                GenericName = product.GenericName,
                Strength = product.Strength,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.CategoryName,
                UomId = product.UomId,
                UomName = product.Uom?.UomName,
                TaxId = product.TaxId,
                TaxName = product.Tax?.TaxName,
                PurchasePrice = product.PurchasePrice,
                SalePrice = product.SalePrice
            };
        }

        public static Product? ToEntity(this ProductDto dto)
        {
            if (dto == null) return null;

            return new Product
            {
                ProductId = dto.ProductId,
                ProductCode = dto.ProductCode,
                ProductName = dto.ProductName,
                GenericName = dto.GenericName,
                Strength = dto.Strength,
                CategoryId = dto.CategoryId,
                UomId = dto.UomId,
                TaxId = dto.TaxId,
                PurchasePrice = dto.PurchasePrice,
                SalePrice = dto.SalePrice
            };
        }
    }
}
