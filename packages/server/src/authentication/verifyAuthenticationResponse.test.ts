import base64url from 'base64url';
import verifyAuthenticationResponse from './verifyAuthenticationResponse';

import * as decodeClientDataJSON from '../helpers/decodeClientDataJSON';
import * as parseAuthenticatorData from '../helpers/parseAuthenticatorData';
import toHash from '../helpers/toHash';
import {
  AuthenticatorDevice,
  AuthenticationCredentialJSON,
} from '@simplewebauthn/typescript-types';

let mockDecodeClientData: jest.SpyInstance;
let mockParseAuthData: jest.SpyInstance;

beforeEach(() => {
  mockDecodeClientData = jest.spyOn(decodeClientDataJSON, 'default');
  mockParseAuthData = jest.spyOn(parseAuthenticatorData, 'default');
});

afterEach(() => {
  mockDecodeClientData.mockRestore();
  mockParseAuthData.mockRestore();
});

test('should verify an assertion response', () => {
  const verification = verifyAuthenticationResponse({
    credential: assertionResponse,
    expectedChallenge: assertionChallenge,
    expectedOrigin: assertionOrigin,
    expectedRPID: 'dev.dontneeda.pw',
    authenticator: authenticator,
  });

  expect(verification.verified).toEqual(true);
});

test('should return authenticator info after verification', () => {
  const verification = verifyAuthenticationResponse({
    credential: assertionResponse,
    expectedChallenge: assertionChallenge,
    expectedOrigin: assertionOrigin,
    expectedRPID: 'dev.dontneeda.pw',
    authenticator: authenticator,
  });

  expect(verification.authenticationInfo.newCounter).toEqual(144);
  expect(verification.authenticationInfo.credentialID).toEqual(authenticator.credentialID);
});

test('should throw when response challenge is not expected value', () => {
  expect(() => {
    verifyAuthenticationResponse({
      credential: assertionResponse,
      expectedChallenge: 'shouldhavebeenthisvalue',
      expectedOrigin: 'https://different.address',
      expectedRPID: 'dev.dontneeda.pw',
      authenticator: authenticator,
    });
  }).toThrow(/authentication response challenge/i);
});

test('should throw when response origin is not expected value', () => {
  expect(() => {
    verifyAuthenticationResponse({
      credential: assertionResponse,
      expectedChallenge: assertionChallenge,
      expectedOrigin: 'https://different.address',
      expectedRPID: 'dev.dontneeda.pw',
      authenticator: authenticator,
    });
  }).toThrow(/authentication response origin/i);
});

test('should throw when assertion type is not webauthn.create', () => {
  // @ts-ignore 2345
  mockDecodeClientData.mockReturnValue({
    origin: assertionOrigin,
    type: 'webauthn.badtype',
    challenge: assertionChallenge,
  });

  expect(() => {
    verifyAuthenticationResponse({
      credential: assertionResponse,
      expectedChallenge: assertionChallenge,
      expectedOrigin: assertionOrigin,
      expectedRPID: 'dev.dontneeda.pw',
      authenticator: authenticator,
    });
  }).toThrow(/authentication response type/i);
});

test('should throw error if user was not present', () => {
  mockParseAuthData.mockReturnValue({
    rpIdHash: toHash(Buffer.from('dev.dontneeda.pw', 'ascii')),
    flags: 0,
  });

  expect(() => {
    verifyAuthenticationResponse({
      credential: assertionResponse,
      expectedChallenge: assertionChallenge,
      expectedOrigin: assertionOrigin,
      expectedRPID: 'dev.dontneeda.pw',
      authenticator: authenticator,
    });
  }).toThrow(/not present/i);
});

test('should throw error if previous counter value is not less than in response', () => {
  // This'll match the `counter` value in `assertionResponse`, simulating a potential replay attack
  const badCounter = 144;
  const badDevice = {
    ...authenticator,
    counter: badCounter,
  };

  expect(() => {
    verifyAuthenticationResponse({
      credential: assertionResponse,
      expectedChallenge: assertionChallenge,
      expectedOrigin: assertionOrigin,
      expectedRPID: 'dev.dontneeda.pw',
      authenticator: badDevice,
    });
  }).toThrow(/counter value/i);
});

test('should throw error if assertion RP ID is unexpected value', () => {
  mockParseAuthData.mockReturnValue({
    rpIdHash: toHash(Buffer.from('bad.url', 'ascii')),
    flags: 0,
  });

  expect(() => {
    verifyAuthenticationResponse({
      credential: assertionResponse,
      expectedChallenge: assertionChallenge,
      expectedOrigin: assertionOrigin,
      expectedRPID: 'dev.dontneeda.pw',
      authenticator: authenticator,
    });
  }).toThrow(/rp id/i);
});

test('should not compare counters if both are 0', () => {
  const verification = verifyAuthenticationResponse({
    credential: assertionFirstTimeUsedResponse,
    expectedChallenge: assertionFirstTimeUsedChallenge,
    expectedOrigin: assertionFirstTimeUsedOrigin,
    expectedRPID: 'dev.dontneeda.pw',
    authenticator: authenticatorFirstTimeUsed,
  });

  expect(verification.verified).toEqual(true);
});

test('should throw an error if user verification is required but user was not verified', () => {
  const actualData = parseAuthenticatorData.default(
    base64url.toBuffer(assertionResponse.response.authenticatorData),
  );

  mockParseAuthData.mockReturnValue({
    ...actualData,
    flags: {
      up: true,
      uv: false,
    },
  });

  expect(() => {
    verifyAuthenticationResponse({
      credential: assertionResponse,
      expectedChallenge: assertionChallenge,
      expectedOrigin: assertionOrigin,
      expectedRPID: 'dev.dontneeda.pw',
      authenticator: authenticator,
      fidoUserVerification: 'required',
    });
  }).toThrow(/user could not be verified/i);
});

// TODO: Get a real TPM authentication response in here
test.skip('should verify TPM assertion', () => {
  const expectedChallenge = 'dG90YWxseVVuaXF1ZVZhbHVlRXZlcnlBc3NlcnRpb24';
  jest.spyOn(base64url, 'encode').mockReturnValueOnce(expectedChallenge);
  const verification = verifyAuthenticationResponse({
    credential: {
      id: 'YJ8FMM-AmcUt73XPX341WXWd7ypBMylGjjhu0g3VzME',
      rawId: 'YJ8FMM-AmcUt73XPX341WXWd7ypBMylGjjhu0g3VzME',
      response: {
        authenticatorData: 'PdxHEOnAiLIp26idVjIguzn3Ipr_RlsKZWsa-5qK-KAFAAAAAQ',
        clientDataJSON:
          'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiZEc5MFlXeHNlVlZ1YVhGMVpWWmhiSFZsUlhabGNubEJjM05sY25ScGIyNCIsIm9yaWdpbiI6Imh0dHBzOi8vZGV2LmRvbnRuZWVkYS5wdyIsImNyb3NzT3JpZ2luIjpmYWxzZX0',
        signature:
          'T6nS6IDnfXmt_f2BEzIvw86RrHCpmf_OQIbiY-OBgk4jyKakYF34tnpdajQnIHTCa3-56RWDa_tZGQwZopEcrWRgSONKnMEboNhsw0aTYDo2q4fICD33qVFUuBIEcWJJyv1RqfW3uvPZAq1yvif81xPWYgF796fx7fFZzbBQARbUjNPudBuwgONljRbDstRhqnrP_b7h0-_CQ8EBJIR7Bor-R5I6JYsNWeR9r0wRPkpIhNRND-y6or6Shm2NXhr-ovLtnzpdouzlrJUJWnBJquWAjtiXKZsGfsY9Srh7jduoyKyPkwItPewcdlV30uUFCtPMepaJ5lUwbBtRE0NsXg',
        userHandle: 'aW50ZXJuYWxVc2VySWQ',
      },
      type: 'public-key',
      clientExtensionResults: {},
    },
    expectedChallenge,
    expectedOrigin: assertionOrigin,
    expectedRPID: 'dev.dontneeda.pw',
    authenticator: {
      credentialPublicKey: base64url.toBuffer('BAEAAQ'),
      credentialID: base64url.toBuffer('YJ8FMM-AmcUt73XPX341WXWd7ypBMylGjjhu0g3VzME'),
      counter: 0,
    },
  });

  expect(verification.verified).toEqual(true);
});

test('should support multiple possible origins', () => {
  const verification = verifyAuthenticationResponse({
    credential: assertionResponse,
    expectedChallenge: assertionChallenge,
    expectedOrigin: ['https://simplewebauthn.dev', assertionOrigin],
    expectedRPID: 'dev.dontneeda.pw',
    authenticator: authenticator,
  });

  expect(verification.verified).toEqual(true);
});

test('should throw an error if origin not in list of expected origins', async () => {
  expect(() => {
    verifyAuthenticationResponse({
      credential: assertionResponse,
      expectedChallenge: assertionChallenge,
      expectedOrigin: ['https://simplewebauthn.dev', 'https://fizz.buzz'],
      expectedRPID: 'dev.dontneeda.pw',
      authenticator: authenticator,
    });
  }).toThrow(/unexpected authentication response origin/i);
});

test('should support multiple possible RP IDs', async () => {
  const verification = verifyAuthenticationResponse({
    credential: assertionResponse,
    expectedChallenge: assertionChallenge,
    expectedOrigin: assertionOrigin,
    expectedRPID: ['dev.dontneeda.pw', 'simplewebauthn.dev'],
    authenticator: authenticator,
  });

  expect(verification.verified).toEqual(true);
});

test('should throw an error if RP ID not in list of possible RP IDs', async () => {
  expect(() => {
    verifyAuthenticationResponse({
      credential: assertionResponse,
      expectedChallenge: assertionChallenge,
      expectedOrigin: assertionOrigin,
      expectedRPID: ['simplewebauthn.dev'],
      authenticator: authenticator,
    });
  }).toThrow(/unexpected rp id/i);
});

/**
 * Assertion examples below
 */

const assertionResponse: AuthenticationCredentialJSON = {
  id: 'KEbWNCc7NgaYnUyrNeFGX9_3Y-8oJ3KwzjnaiD1d1LVTxR7v3CaKfCz2Vy_g_MHSh7yJ8yL0Pxg6jo_o0hYiew',
  rawId: 'KEbWNCc7NgaYnUyrNeFGX9_3Y-8oJ3KwzjnaiD1d1LVTxR7v3CaKfCz2Vy_g_MHSh7yJ8yL0Pxg6jo_o0hYiew',
  response: {
    authenticatorData: 'PdxHEOnAiLIp26idVjIguzn3Ipr_RlsKZWsa-5qK-KABAAAAkA==',
    clientDataJSON:
      'eyJjaGFsbGVuZ2UiOiJkRzkwWVd4c2VWVnVhWEYxWlZaaGJIVmxSWFpsY25sVWFXMWwiLCJj' +
      'bGllbnRFeHRlbnNpb25zIjp7fSwiaGFzaEFsZ29yaXRobSI6IlNIQS0yNTYiLCJvcmlnaW4iOiJodHRwczovL2Rldi5k' +
      'b250bmVlZGEucHciLCJ0eXBlIjoid2ViYXV0aG4uZ2V0In0=',
    signature:
      'MEUCIQDYXBOpCWSWq2Ll4558GJKD2RoWg958lvJSB_GdeokxogIgWuEVQ7ee6AswQY0OsuQ6y8Ks6' +
      'jhd45bDx92wjXKs900=',
  },
  clientExtensionResults: {},
  type: 'public-key',
};
const assertionChallenge = base64url.encode('totallyUniqueValueEveryTime');
const assertionOrigin = 'https://dev.dontneeda.pw';

const authenticator: AuthenticatorDevice = {
  credentialPublicKey: base64url.toBuffer(
    'pQECAyYgASFYIIheFp-u6GvFT2LNGovf3ZrT0iFVBsA_76rRysxRG9A1Ilgg8WGeA6hPmnab0HAViUYVRkwTNcN77QBf_RR0dv3lIvQ',
  ),
  credentialID: base64url.toBuffer(
    'KEbWNCc7NgaYnUyrNeFGX9_3Y-8oJ3KwzjnaiD1d1LVTxR7v3CaKfCz2Vy_g_MHSh7yJ8yL0Pxg6jo_o0hYiew',
  ),
  counter: 143,
};

/**
 * Represented a device that's being used on the website for the first time
 */
const assertionFirstTimeUsedResponse: AuthenticationCredentialJSON = {
  id: 'wSisR0_4hlzw3Y1tj4uNwwifIhRa-ZxWJwWbnfror0pVK9qPdBPO5pW3gasPqn6wXHb0LNhXB_IrA1nFoSQJ9A',
  rawId: 'wSisR0_4hlzw3Y1tj4uNwwifIhRa-ZxWJwWbnfror0pVK9qPdBPO5pW3gasPqn6wXHb0LNhXB_IrA1nFoSQJ9A',
  response: {
    authenticatorData: 'PdxHEOnAiLIp26idVjIguzn3Ipr_RlsKZWsa-5qK-KABAAAAAA',
    clientDataJSON:
      'eyJjaGFsbGVuZ2UiOiJkRzkwWVd4c2VWVnVhWEYxWlZaaGJIVmxSWFpsY25sQmMzTmxjblJwYjI0IiwiY2xpZW50RXh0ZW5zaW9ucyI6e30sImhhc2hBbGdvcml0aG0iOiJTSEEtMjU2Iiwib3JpZ2luIjoiaHR0cHM6Ly9kZXYuZG9udG5lZWRhLnB3IiwidHlwZSI6IndlYmF1dGhuLmdldCJ9',
    signature:
      'MEQCIBu6M-DGzu1O8iocGHEj0UaAZm0HmxTeRIE6-nS3_CPjAiBDsmIzy5sacYwwzgpXqfwRt_2vl5yiQZ_OAqWJQBGVsQ',
  },
  type: 'public-key',
  clientExtensionResults: {},
};
const assertionFirstTimeUsedChallenge = base64url.encode('totallyUniqueValueEveryAssertion');
const assertionFirstTimeUsedOrigin = 'https://dev.dontneeda.pw';
const authenticatorFirstTimeUsed: AuthenticatorDevice = {
  credentialPublicKey: base64url.toBuffer(
    'pQECAyYgASFYIGmaxR4mBbukc2QhtW2ldhAAd555r-ljlGQN8MbcTnPPIlgg9CyUlE-0AB2fbzZbNgBvJuRa7r6o2jPphOmtyNPR_kY',
  ),
  credentialID: base64url.toBuffer(
    'wSisR0_4hlzw3Y1tj4uNwwifIhRa-ZxWJwWbnfror0pVK9qPdBPO5pW3gasPqn6wXHb0LNhXB_IrA1nFoSQJ9A',
  ),
  counter: 0,
};
