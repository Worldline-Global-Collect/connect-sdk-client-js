import type {
  BasicPaymentProductJSON,
  DeviceInformation,
  Metadata,
} from '../types';

import { version, creator as sdkCreator } from '../../package.json';

export const client = {
  unsupportedPaymentProductsInBrowser: new Set<BasicPaymentProductJSON['id']>(),

  getDeviceInformation(): DeviceInformation {
    return {
      timezoneOffsetUtcMinutes: new Date().getTimezoneOffset(),
      locale: navigator.language,
      browserData: {
        javaScriptEnabled: true,
        colorDepth: screen.colorDepth,
        screenHeight: screen.height,
        screenWidth: screen.width,
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
      },
    };
  },

  getMetadata(): Metadata {
    const rppEnabledPage = (
      document as typeof document & {
        GC?: { rppEnabledPage: boolean };
      }
    ).GC?.rppEnabledPage;
    const sdkIdentifierPrefix = rppEnabledPage ? 'rpp-' : '';
    return {
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      platformIdentifier: window.navigator.userAgent,
      sdkIdentifier: `${sdkIdentifierPrefix}JavaScriptClientSDK/v${version}`,
      sdkCreator,
    };
  },
};
