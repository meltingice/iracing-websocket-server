iracing-websocket-server
========================

A WebSocket based server that streams data from iRacing to the browser.

![](http://i.imgur.com/ArsQqqT.png)

# Running 
First install the deps:

```
npm install 
```

Then just run the script:

```
node app.js
```

An point a webbrowser to http://localhost:3000

## Possible errors
You need to have Visual Studio installed to build the C++ part of the code. You can download this free at: http://www.visualstudio.com/en-us/products/visual-studio-express-vs.aspx

You might also have to tell npm what version you are using:

```
npm install --msvs_version=2012
```
