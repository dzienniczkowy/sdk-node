export interface FailResponse {
  success: false;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type Response<T> = FailResponse | SuccessResponse<T>;
