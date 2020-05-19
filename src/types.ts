export type AttestationCredentials = {
  publicKey: PublicKeyCredentialCreationOptions,
};

export type AssertionCredentials = {
  publicKey: PublicKeyCredentialRequestOptions,
};

/**
 * A slightly-modified AuthenticatorAttestationResponse to simplify working with ArrayBuffers that
 * are base64-encoded in the browser so that they can be sent as JSON to the server.
 */
export interface EncodedAuthenticatorAttestationResponse extends Omit<
AuthenticatorAttestationResponse, 'clientDataJSON' | 'attestationObject'
> {
  base64ClientDataJSON: string,
  base64AttestationObject: string;
}

export enum ATTESTATION_FORMATS {
  FIDO_U2F = 'fido-u2f',
  PACKED = 'packed',
  ANDROID_SAFETYNET = 'android-safetynet',
  NONE = 'none',
};

export type AttestationObject = {
  fmt: ATTESTATION_FORMATS,
  attStmt: {
    sig?: Buffer,
    x5c?: Buffer[],
    ecdaaKeyId?: Buffer,
  },
  authData: Buffer,
};

export type ParsedAttestationAuthData = {
  rpIdHash: Buffer,
  flagsBuf: Buffer,
  flags: {
      up: boolean,
      uv: boolean,
      at: boolean,
      ed: boolean,
      flagsInt: number,
  },
  counter: number,
  counterBuf: Buffer,
  aaguid?: Buffer,
  credentialID?: Buffer,
  COSEPublicKey?: Buffer,
};

export type ClientDataJSON = {
  type: string,
  challenge: string,
  origin: string,
};

export type VerifiedAttestation = {
  verified: boolean,
  authenticatorInfo?: {
    fmt: ATTESTATION_FORMATS,
    counter: number,
    base64PublicKey: string,
    base64CredentialID: string,
  },
};

export type CertificateInfo = {
  subject: { [key: string]: string },
  version: number,
  basicConstraintsCA: boolean,
};
