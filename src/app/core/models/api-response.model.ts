export interface ApiResponse<T> {
  code: number;
  message: string;
  timestamp: string;
  result: T;
}
