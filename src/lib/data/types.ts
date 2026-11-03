import type { PricePoint } from "@/lib/finance";

export type DataSource = "live" | "sample";

export interface PriceSeries {
  symbol: string;
  points: PricePoint[];
}

export interface PricesResponse {
  source: DataSource;
  series: PriceSeries[];
}

export type DataErrorCode =
  | "INVALID_TICKER"
  | "NOT_ENOUGH_DATA"
  | "PLAN_LIMIT"
  | "RATE_LIMIT"
  | "NETWORK"
  | "UPSTREAM"
  | "BAD_REQUEST";

export interface ApiErrorBody {
  error: { code: DataErrorCode; message: string; symbol?: string };
}

export class DataError extends Error {
  readonly code: DataErrorCode;
  readonly symbol?: string;

  constructor(code: DataErrorCode, message: string, symbol?: string) {
    super(message);
    this.name = "DataError";
    this.code = code;
    this.symbol = symbol;
  }
}
