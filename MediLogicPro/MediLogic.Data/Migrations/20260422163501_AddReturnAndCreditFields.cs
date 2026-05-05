using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediLogic.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReturnAndCreditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ReturnedQuantity",
                table: "SalesDetail",
                type: "decimal(18,2)",
                nullable: true,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ReturnedQuantity",
                table: "PurchaseDetail",
                type: "decimal(18,2)",
                nullable: true,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CreditBalance",
                table: "Party",
                type: "decimal(18,2)",
                nullable: true,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReturnedQuantity",
                table: "SalesDetail");

            migrationBuilder.DropColumn(
                name: "ReturnedQuantity",
                table: "PurchaseDetail");

            migrationBuilder.DropColumn(
                name: "CreditBalance",
                table: "Party");
        }
    }
}
