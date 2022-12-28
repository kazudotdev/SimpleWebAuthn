import { SettingsService } from '../../services/settingsService';
import { isoBase64URL } from '../../helpers/iso';

import { verifyRegistrationResponse } from '../verifyRegistrationResponse';

/**
 * Clear out root certs for android-key since responses were captured from FIDO Conformance testing
 * and have cert paths that can't be validated with known root certs from Google
 */
SettingsService.setRootCertificates({ identifier: 'android-key', certificates: [] });

test('should verify Android KeyStore response', async () => {
  const expectedChallenge = '4ab7dfd1-a695-4777-985f-ad2993828e99';
  jest.spyOn(isoBase64URL, 'fromString').mockReturnValueOnce(expectedChallenge);
  const verification = await verifyRegistrationResponse({
    response: {
      id: 'V51GE29tGbhby7sbg1cZ_qL8V8njqEsXpAnwQBobvgw',
      rawId: 'V51GE29tGbhby7sbg1cZ_qL8V8njqEsXpAnwQBobvgw',
      response: {
        attestationObject:
          'o2NmbXRrYW5kcm9pZC1rZXlnYXR0U3RtdKNjYWxnJmNzaWdYRzBFAiAbZhfcF0KSXj5rdEevvnBcC8ZfRQlNl9XYWRTiIGKSHwIhAIerc7jWjOF_lJ71n_GAcaHwDUtPxkjAAdYugnZ4QxkmY3g1Y4JZAxowggMWMIICvaADAgECAgEBMAoGCCqGSM49BAMCMIHkMUUwQwYDVQQDDDxGQUtFIEFuZHJvaWQgS2V5c3RvcmUgU29mdHdhcmUgQXR0ZXN0YXRpb24gSW50ZXJtZWRpYXRlIEZBS0UxMTAvBgkqhkiG9w0BCQEWImNvbmZvcm1hbmNlLXRvb2xzQGZpZG9hbGxpYW5jZS5vcmcxFjAUBgNVBAoMDUZJRE8gQWxsaWFuY2UxIjAgBgNVBAsMGUF1dGhlbnRpY2F0b3IgQXR0ZXN0YXRpb24xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJNWTESMBAGA1UEBwwJV2FrZWZpZWxkMCAXDTcwMDIwMTAwMDAwMFoYDzIwOTkwMTMxMjM1OTU5WjApMScwJQYDVQQDDB5GQUtFIEFuZHJvaWQgS2V5c3RvcmUgS2V5IEZBS0UwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARuowgSu5AoRj8Vi_ZNSFBbGUZJXFG9MkDT6jADlr7tOK9NEgjVX53-ergXpyPaFZrAR9py-xnzfjILn_Kzb8Iqo4IBFjCCARIwCwYDVR0PBAQDAgeAMIHhBgorBgEEAdZ5AgERBIHSMIHPAgECCgEAAgEBCgEABCCfVEl83pSDSerk9I3pcICNTdzc5N3u4jt21cXdzBuJjgQAMGm_hT0IAgYBXtPjz6C_hUVZBFcwVTEvMC0EKGNvbS5hbmRyb2lkLmtleXN0b3JlLmFuZHJvaWRrZXlzdG9yZWRlbW8CAQExIgQgdM_LUHSI9SkQhZHHpQWRnzJ3MvvB2ANSauqYAAbS2JgwMqEFMQMCAQKiAwIBA6MEAgIBAKUFMQMCAQSqAwIBAb-DeAMCAQK_hT4DAgEAv4U_AgUAMB8GA1UdIwQYMBaAFKPSqizvDYzyJALVHLRgvL9qWyQUMAoGCCqGSM49BAMCA0cAMEQCIC7WHb2PyULnjp1M1TVI3Wti_eDhe6sFweuQAdecXtHhAiAS_eZkFsx_VNsrTu3XfZ2D7wIt-vT6nTljfHZ4zqU5xlkDGDCCAxQwggK6oAMCAQICAQIwCgYIKoZIzj0EAwIwgdwxPTA7BgNVBAMMNEZBS0UgQW5kcm9pZCBLZXlzdG9yZSBTb2Z0d2FyZSBBdHRlc3RhdGlvbiBSb290IEZBS0UxMTAvBgkqhkiG9w0BCQEWImNvbmZvcm1hbmNlLXRvb2xzQGZpZG9hbGxpYW5jZS5vcmcxFjAUBgNVBAoMDUZJRE8gQWxsaWFuY2UxIjAgBgNVBAsMGUF1dGhlbnRpY2F0b3IgQXR0ZXN0YXRpb24xCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJNWTESMBAGA1UEBwwJV2FrZWZpZWxkMB4XDTE5MDQyNTA1NDkzMloXDTQ2MDkxMDA1NDkzMlowgeQxRTBDBgNVBAMMPEZBS0UgQW5kcm9pZCBLZXlzdG9yZSBTb2Z0d2FyZSBBdHRlc3RhdGlvbiBJbnRlcm1lZGlhdGUgRkFLRTExMC8GCSqGSIb3DQEJARYiY29uZm9ybWFuY2UtdG9vbHNAZmlkb2FsbGlhbmNlLm9yZzEWMBQGA1UECgwNRklETyBBbGxpYW5jZTEiMCAGA1UECwwZQXV0aGVudGljYXRvciBBdHRlc3RhdGlvbjELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAk1ZMRIwEAYDVQQHDAlXYWtlZmllbGQwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASrUGErYk0Xu8O1GwRJOwVJC4wfi52883my3tygfFKh17YN0yF13Ct-3bwm2wjVX4b2cbaU3DBNpKKKjE4DpvXHo2MwYTAPBgNVHRMBAf8EBTADAQH_MA4GA1UdDwEB_wQEAwIChDAdBgNVHQ4EFgQUo9KqLO8NjPIkAtUctGC8v2pbJBQwHwYDVR0jBBgwFoAUUpobMuBWqs1RD-9fgDcGi_KRIx0wCgYIKoZIzj0EAwIDSAAwRQIhALFvLkAvtHrObTmN8P0-yLIT496P_weSEEbB6vCJWSh9AiBu-UOorCeLcF4WixOG9E5Li2nXe4uM2q6mbKGkll8u-WhhdXRoRGF0YVikPdxHEOnAiLIp26idVjIguzn3Ipr_RlsKZWsa-5qK-KBBAAAAYFUOS1SqR0CfmpUat2wTATEAIFedRhNvbRm4W8u7G4NXGf6i_FfJ46hLF6QJ8EAaG74MpQECAyYgASFYIG6jCBK7kChGPxWL9k1IUFsZRklcUb0yQNPqMAOWvu04Ilggr00SCNVfnf56uBenI9oVmsBH2nL7GfN-Mguf8rNvwio',
        clientDataJSON:
          'eyJvcmlnaW4iOiJodHRwczovL2Rldi5kb250bmVlZGEucHciLCJjaGFsbGVuZ2UiOiI0YWI3ZGZkMS1hNjk1LTQ3NzctOTg1Zi1hZDI5OTM4MjhlOTkiLCJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0',
        transports: ['internal'],
      },
      type: 'public-key',
      clientExtensionResults: {},
    },
    expectedChallenge,
    expectedOrigin: 'https://dev.dontneeda.pw',
    expectedRPID: 'dev.dontneeda.pw',
    requireUserVerification: false,
  });

  expect(verification.verified).toEqual(true);
});
