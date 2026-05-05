using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class SalesPayment
{
    public int PaymentId { get; set; }
    public int SalesId { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, Mobile Banking, Credit
    public decimal Amount { get; set; }
    public string PaymentMode { get; set; } = "Manual"; // Manual, API
    public string PaymentStatus { get; set; } = "Paid"; // Paid, Pending, Failed
    public string? TransactionId { get; set; }
    public string? PaymentNote { get; set; }
    public string? Remarks { get; set; }
    public string? PaymentProvider { get; set; } // Bkash, Nagad, Visa, etc.
    public DateTime PaymentDate { get; set; } = DateTime.Now;

    public virtual SalesMaster? Sales { get; set; }
}
