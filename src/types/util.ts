export type Metadata = {
  readonly screenSize: string;
  readonly platformIdentifier: string;
  readonly sdkIdentifier: string;
  readonly sdkCreator: string;
};

export type BrowserData = {
  readonly javaScriptEnabled: true;
  readonly javaEnabled: boolean;
  readonly colorDepth: number;
  readonly screenHeight: number;
  readonly screenWidth: number;
  readonly innerHeight: number;
  readonly innerWidth: number;
};

export type DeviceInformation = {
  readonly timezoneOffsetUtcMinutes: number;
  readonly locale: string;
  readonly browserData: BrowserData;
};
