export type SdkResponse<Data = unknown> = {
  status: Response['status'];
  success: Response['ok'];
  data: Data;
};

export type APIErrorJSON = {
  category: string;
  code: string;
  httpStatusCode: number;
  id: string;
  message: string;
  propertyName: string;
  requestId: string;
};

export type ErrorResponseJSON = {
  errorId: string;
  errors: APIErrorJSON[];
};
