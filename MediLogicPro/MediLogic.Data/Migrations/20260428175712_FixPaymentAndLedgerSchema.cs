using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediLogic.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixPaymentAndLedgerSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentMode",
                table: "SalesMaster",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentProvider",
                table: "SalesMaster",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentReference",
                table: "SalesMaster",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "SalesMaster",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentProvider",
                table: "PurchaseMaster",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentReference",
                table: "PurchaseMaster",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMode",
                table: "Ledger",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "Ledger",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);



            migrationBuilder.AddColumn<string>(
                name: "TransactionId",
                table: "Ledger",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SalesPayment",
                columns: table => new
                {
                    PaymentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesId = table.Column<int>(type: "int", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentMode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PaymentStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TransactionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentNote = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentProvider = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesPayment", x => x.PaymentId);
                    table.ForeignKey(
                        name: "FK_SalesPayment_SalesMaster_SalesId",
                        column: x => x.SalesId,
                        principalTable: "SalesMaster",
                        principalColumn: "SalesId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SalesPayment_SalesId",
                table: "SalesPayment",
                column: "SalesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SalesPayment");

            migrationBuilder.DropColumn(
                name: "PaymentMode",
                table: "SalesMaster");

            migrationBuilder.DropColumn(
                name: "PaymentProvider",
                table: "SalesMaster");

            migrationBuilder.DropColumn(
                name: "PaymentReference",
                table: "SalesMaster");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "SalesMaster");

            migrationBuilder.DropColumn(
                name: "PaymentProvider",
                table: "PurchaseMaster");

            migrationBuilder.DropColumn(
                name: "PaymentReference",
                table: "PurchaseMaster");

            migrationBuilder.DropColumn(
                name: "PaymentMode",
                table: "Ledger");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "Ledger");



            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "Ledger");
        }
    }
}
