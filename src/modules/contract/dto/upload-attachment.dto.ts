export class UploadAttachmentDto {
  type!:
    | "ID_CARD_FRONT"
    | "ID_CARD_BACK"
    | "HOUSEHOLD_REGISTRATION"
    | "UTILITY_BILL"
    | "DRIVING_LICENSE"
    | "OTHER";
  file_url!: string;
}
