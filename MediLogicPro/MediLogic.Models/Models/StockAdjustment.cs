using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediLogic.Models
{
    public class StockAdjustment
    {
        [Key]
        public int AdjustmentId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public int BranchId { get; set; }

        [Required]
        [MaxLength(100)]
        public string BatchNumber { get; set; } = null!;

        [Required]
        public decimal AdjustedQuantity { get; set; }

        [Required]
        [MaxLength(100)]
        public string Reason { get; set; } = null!; // Breakage, Expired, Missing, Correction

        public string? Remarks { get; set; }

        public DateTime AdjustmentDate { get; set; } = DateTime.Now;

        [Required]
        public string CreatedBy { get; set; } = null!;

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }

        [ForeignKey("BranchId")]
        public virtual Branch? Branch { get; set; }
    }
}
