Lambda functions for the MOOC Fetcher API Backend.

## Setup

### Setup AWS CLI and Credentials
* Install AWS CLI and [configure it][1].
* Make sure you setup the credentials in `~/.aws/credentials`, as specified in the guide linked above. This will then work for the AWS Javascript SDK as well.

[1]:http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-config-files)

### Downloading dependencies
* Run `npm install`

## Testing locally (end-to-end)

```
node lambda_functions/ProcessFetchRequest/test.js
```

This will run an end-to-end test of your lambda function using a dummy context and a dummy event.

## Code style
Running ESLint:

```
npm run lint
```

Running JSCS:

```
npm run jscs
```

You can also add the following pre-commit hook (`.git/hooks/precommit`) to your git config:

```
#!/bin/sh
npm run lint
npm run jscs
```

## Deploying
Your AWS credentials must have sufficient privileges to do this.

```
gulp lambdaProcessFetchRequest
```

This will package the `index.js` file corresponding to the Lambda function _ProcessFetchRequest_ and deploy it using the AWS SDK.
