export class MakePaymentDto {
  amount!: number;
  method!: "CASH" | "BANK" | "CARD";
  note?: string;
}