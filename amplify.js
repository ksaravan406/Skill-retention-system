
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-southeast-2_e8SA586tq",
      userPoolClientId: "4ihrncc15r5gau67joi96721b2",
      loginWith: {
        email: true,
      },
    },
  },
});
