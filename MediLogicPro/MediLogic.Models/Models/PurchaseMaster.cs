using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MediLogic.Models;

public partial class PurchaseMaster
{
    [JsonPropertyName("purchaseId")]
    public int PurchaseId { get; set; }

    [JsonPropertyName("purchaseNo")]
    public string? PurchaseNo { get; set; }

    [JsonPropertyName("supplierId")]
    public int? SupplierId { get; set; }

    [JsonPropertyName("branchId")]
    public int? BranchId { get; set; }

    [JsonPropertyName("totalAmount")]
    public decimal TotalAmount { get; set; }

    [JsonPropertyName("discount")]
    public decimal? Discount { get; set; }

    [JsonPropertyName("netAmount")]
    public decimal? NetAmount { get; set; }

    [JsonPropertyName("purchaseDate")]
    public DateTime? PurchaseDate { get; set; }

    [JsonPropertyName("paymentMethod")]
    public string? PaymentMethod { get; set; }

    [JsonPropertyName("paymentReference")]
    public string? PaymentReference { get; set; }

    [JsonPropertyName("paymentProvider")]
    public string? PaymentProvider { get; set; }

    [JsonPropertyName("changeAmount")]
    public decimal? ChangeAmount { get; set; }

    [JsonPropertyName("branch")]
    public virtual Branch? Branch { get; set; }

    [JsonPropertyName("purchaseDetails")]
    public virtual ICollection<PurchaseDetail> PurchaseDetails { get; set; } = new List<PurchaseDetail>();

    [JsonPropertyName("purchaseReturnMasters")]
    public virtual ICollection<PurchaseReturnMaster> PurchaseReturnMasters { get; set; } = new List<PurchaseReturnMaster>();

    [JsonPropertyName("purchasePayments")]
    public virtual ICollection<PurchasePayment> PurchasePayments { get; set; } = new List<PurchasePayment>();

    [JsonPropertyName("supplier")]
    public virtual Party? Supplier { get; set; }
}
