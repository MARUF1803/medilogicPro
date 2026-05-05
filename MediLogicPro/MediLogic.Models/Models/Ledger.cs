using System;
using System.Collections.Generic;

namespace MediLogic.Models;

public partial class Ledger
{
    public int LedgerId { get; set; }

    public DateTime TransactionDate { get; set; }

    public string? Description { get; set; }

    public string? TransactionType { get; set; } // Sale, Purchase, Return, etc.

    public string? ReferenceNo { get; set; } // InvoiceNo or ReturnNo

    public decimal Debit { get; set; }

    public decimal Credit { get; set; }

    public int? PartyId { get; set; }

    public int? BranchId { get; set; }

    public virtual Branch? Branch { get; set; }

    public int? RelatedId { get; set; } // ID of the Sale, Purchase, or Return

    public virtual Party? Party { get; set; }
    public string? PaymentStatus { get; set; }
    public string? PaymentMode { get; set; }
    public string? TransactionId { get; set; }
}
