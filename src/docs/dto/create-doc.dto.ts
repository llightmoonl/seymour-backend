export class CreateDocDto {
  id?: string;
  slug: string;
  title: string;
  description?: string | null;
  content: string;
  order?: number;
  published?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
