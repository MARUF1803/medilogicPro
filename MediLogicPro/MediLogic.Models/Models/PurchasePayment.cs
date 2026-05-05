using System;

namespace MediLogic.Models;

public partial class PurchasePayment
{
    public int PaymentId { get; set; }
    public int PurchaseId { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, Mobile Banking, Supplier Credit
    public decimal Amount { get; set; }
    public string PaymentMode { get; set; } = "Manual"; // Manual, API
    public string PaymentStatus { get; set; } = "Paid"; // Paid, Pending, Failed
    public string? TransactionId { get; set; }
    public string? PaymentNote { get; set; }
    public string? Remarks { get; set; }
    public string? PaymentProvider { get; set; } // Bkash, Nagad, Visa, etc.
    public DateTime PaymentDate { get; set; } = DateTime.Now;

    public virtual PurchaseMaster? Purchase { get; set; }
}
