# What is this?

AWS Lambda application code.  
This app Return the png binary by passing the PDF URL in the query parameter.  

# Development Environment

docker  
nodejs 12.x runtime

```bash
# bash
$ docker run -v "$PWD":/var/task -it lambci/lambda:build-nodejs12.x bash
```

```bash
$ cp /usr/lib64/{libmount.so.1,libuuid.so.1,libblkid.so.1} lib/
$ npm i
```

FYI: https://github.com/lambci/docker-lambda

# Deployment

## sam-cli
Do something.

## Upload zip package on the AWS console 

### zip

```bash
$ zip -9r pdf2png *
```

### upload
Upload it and done.