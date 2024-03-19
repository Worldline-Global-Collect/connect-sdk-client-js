import type { DirectoryJSON } from '../../types';

export const paymentProductDirectoryJson: DirectoryJSON = {
  entries: [
    {
      countryNames: ['Nederland'],
      issuerId: 'INGBNL2A',
      issuerList: 'short',
      issuerName: 'ING',
    },
    {
      countryNames: ['Nederland'],
      issuerId: 'RABONL2U',
      issuerList: 'short',
      issuerName: 'RABONL2U - eWL Issuer Simulation',
    },
    {
      countryNames: ['Nederland'],
      issuerId: 'BANKNL3Y',
      issuerList: 'short',
      issuerName: 'TEST iDEAL issuer',
    },
    {
      countryNames: ['Nederland'],
      issuerId: 'BANKNL2Y',
      issuerList: 'short',
      issuerName: 'eWL Issuer Simulation',
    },
  ],
};
