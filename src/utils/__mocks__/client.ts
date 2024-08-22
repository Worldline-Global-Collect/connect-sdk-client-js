import type {
  BasicPaymentProductJSON,
  DeviceInformation,
  Metadata,
} from '../../types';
import { creator as sdkCreator, version } from '../../../package.json';

export const client = {
  unsupportedPaymentProductsInBrowser: new Set<BasicPaymentProductJSON['id']>(),

  getDeviceInformation(): DeviceInformation {
    return {
      timezoneOffsetUtcMinutes: -120,
      locale: 'en-GB',
      browserData: {
        javaScriptEnabled: true,
        javaEnabled: false,
        colorDepth: 24,
        screenHeight: 1440,
        screenWidth: 3440,
        innerHeight: 1440,
        innerWidth: 3440,
      },
    };
  },

  getMetadata(): Metadata {
    return {
      screenSize: `3440x1440`,
      platformIdentifier:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
      sdkIdentifier: `JavaScriptClientSDK/v${version}`,
      sdkCreator,
    };
  },
};
