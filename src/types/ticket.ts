export enum SourceEnum {
  Sso,
  Shoac,
  Sgt
}

export interface Price {
  price: number;
  isSoldOut: boolean;
}

export interface DatePrice {
  date: Date;
  price?: Price[] | null
}

export interface Ticket {
  title: string;
  date: DatePrice[];
  url: string;
  source: SourceEnum;
  cover?: string,
  hall?: string;
  remark?: string | null;
  description?: string | null;
}