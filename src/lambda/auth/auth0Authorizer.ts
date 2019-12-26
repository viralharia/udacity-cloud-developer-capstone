import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
//import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import * as util from 'util'

//const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://udagram-serverless.auth0.com/.well-known/jwks.json';
let auth0Certificate;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  console.log('Authorizing a user - '+event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    console.log('jwtToken - '+jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader); 

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  

  // retrieve the jwk
  const auth0certificate = await getAuth0Certificate();
  const jwks = auth0certificate.data;
  const keys:any[] = jwks.keys;

  //console.log("jwks - "+util.inspect(jwks, false, null, true));

  // Decode the JWT and grab the kid property from the header.
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  //Find the signing key in the filtered JWKS with a matching kid property.  
  const signingKey = keys.find(key => key.kid === jwt.header.kid);

  let certValue:string = signingKey.x5c[0];
  
  certValue = certValue.match(/.{1,64}/g).join('\n');
  const finalCertKey:string = `-----BEGIN CERTIFICATE-----\n${certValue}\n-----END CERTIFICATE-----\n`;

  //console.log("finalCertKey - "+util.inspect(finalCertKey, false, null, true));

  //verify
  let jwtPayload:JwtPayload = verify(token, finalCertKey, { algorithms: ['RS256'] }) as JwtPayload; 
  
  return jwtPayload;  
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getAuth0Certificate(): Promise<any> {
  if(auth0Certificate == null){
    auth0Certificate = await Axios.get(jwksUrl);
  }
  return auth0Certificate;
}
