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
node lambda_functions/ProcessFetchRequest/end_to_end_test.js
```

This will run an end-to-end test of your lambda function using a dummy context and a dummy event.

## Code style
Running ESLint:

```
npm run lint
```

Running JSCS:

```
./node_modules/bin/jscs -x <path>
```

You can also add the following pre-commit hook (`.git/hooks/precommit`) to your git config:

```
#!/bin/sh
npm run lint
```

## Building and Deploying

You can build a lambda function (for e.g. `ProcessFetchRequest` using:

```
gulp ProcessFetchRequest:build
```

To copy the lambda function code in a zipped format to AWS, you can do something like the following (your AWS credentials must have sufficient privileges to do this).

```
gulp ProcessFetchRequest:upload
```

This will automatically trigger an build, before performing an upload.

