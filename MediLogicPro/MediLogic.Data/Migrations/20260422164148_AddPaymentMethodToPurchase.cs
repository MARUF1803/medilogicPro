using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediLogic.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentMethodToPurchase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "PurchaseMaster",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "PurchaseMaster");
        }
    }
}
