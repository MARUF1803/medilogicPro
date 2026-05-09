using System;
using System.Text.Json.Serialization;

namespace MediLogic.Models;

public partial class PurchasePayment
{
    [JsonPropertyName("paymentId")]
    public int PaymentId { get; set; }

    [JsonPropertyName("purchaseId")]
    public int PurchaseId { get; set; }

    [JsonPropertyName("paymentMethod")]
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, Mobile Banking, Supplier Credit

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("paymentMode")]
    public string PaymentMode { get; set; } = "Manual"; // Manual, API

    [JsonPropertyName("paymentStatus")]
    public string PaymentStatus { get; set; } = "Paid"; // Paid, Pending, Failed

    [JsonPropertyName("transactionId")]
    public string? TransactionId { get; set; }

    [JsonPropertyName("paymentNote")]
    public string? PaymentNote { get; set; }

    [JsonPropertyName("remarks")]
    public string? Remarks { get; set; }

    [JsonPropertyName("paymentProvider")]
    public string? PaymentProvider { get; set; } // Bkash, Nagad, Visa, etc.

    [JsonPropertyName("paymentDate")]
    public DateTime PaymentDate { get; set; } = DateTime.Now;

    [JsonIgnore]
    public virtual PurchaseMaster? Purchase { get; set; }
}
