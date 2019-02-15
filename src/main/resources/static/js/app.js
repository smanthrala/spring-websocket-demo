"use strict";
process.title = 'live-revue';
var webSocketsServerPort = process.env.PORT || 1980;
var webSocketServer = require('websocket').server;
var http = require('http');
var nodemailer = require('nodemailer');
var serverExpress = require('express');
var clientExpress = require('express');
const serverApp = serverExpress();
const clientApp = clientExpress();
const serverPort = 3000;
const clientPort = 3300;
var data = {};
var uidClientConns = {};
var uidSupportConns = {};
var uidServerConns = {};
var conns = {};

var getServerHeightWidth = function(uuid, key){
  let height=200, width=200;
  if(uidServerConns[uuid] && uidServerConns[uuid].key===key){
    height=uidServerConns[uuid].height;
    width=uidServerConns[uuid].width;
  }
  return {height,width};
}
var validate = function(req, sharedWith){
  let sessionKey = req.query.uid, authKey = req.query.key;
  return (uidServerConns[sessionKey] && uidServerConns[sessionKey].key===authKey && uidServerConns[sessionKey].sharedWith===sharedWith );
}
serverApp.get('/', (req, res) => res.send('Hello World!'));
serverApp.use(serverExpress.static('public'));
serverApp.listen(serverPort, () => console.log(`Example app listening on port ${serverPort}!`));
clientApp.get('/c/c', (req, res) => {
  
  if(validate(req, 'c'))
    res.send({status:'success'});
  else
    res.send({status:'auth-error'});
});
clientApp.get('/s/c', (req, res) => {
  if(validate(req, 's'))
    res.send(Object.assign(getServerHeightWidth(req.query.uid, req.query.key), {status:"success"}));
  else
    res.send({status:'auth-error'});
});
clientApp.use(clientExpress.static('public'));
clientApp.listen(clientPort, () => console.log(`Example app listening on port ${clientPort}!`));
var guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  //return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  return s4() + s4() + s4() + s4() + s4() + s4();
}

var emailLink = function (to, link) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '',
      pass: ''
    }
  });
  var mailOptions = {
    from: '',
    to,
    subject: 'Join Agent Session',
    text: link
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

var populateData = function (payload, obj) {
  if (!obj) {
    return payload;
  }
  obj.eleVal = payload.eleVal;
  obj.role = payload.role;
  if (payload.type === 'delegate')
    obj['allow-data-input'] = payload['allow-data-input'];
  else
    payload['allow-data-input'] = obj['allow-data-input'];
  obj.eleName = payload.eleName;
  obj.eleType = payload.eleType;
  obj.evtType = payload.evtType;
  obj.type = payload.type;
  obj.eleLabel = payload.eleLabel;
  obj.evtFor=payload.evtFor;
}
function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
var sendDataToServer = function (uid, data) {
  if (uidServerConns[uid])
    uidServerConns[uid].conn.sendUTF(JSON.stringify(data));
}
var sendDataToClient = function (uid, data) {
  console.log(uidClientConns[uid]!==null);
  if (uidClientConns[uid])
    uidClientConns[uid].sendUTF(JSON.stringify(data));
}
var sendDataToSupport = function (uid, data) {
  if (uidSupportConns[uid])
    uidSupportConns[uid].sendUTF(JSON.stringify(data));
}
var cleanupAfterServerSession = function (uid, serverStatus) {
  sendDataToClient(uid, { type: serverStatus });
  sendDataToSupport(uid, { type: serverStatus });
  data[uid] = [];
  delete uidServerConns[uid];
}
var getDataFor = function(evtFor, payloadId){
  if(data[payloadId]){
    data[payloadId].filter(obj=>obj.evtFor===evtFor);
  }
}
var server = http.createServer(function (request, response) {
  //console.log(request);
});
server.listen(webSocketsServerPort, function () {
  console.log((new Date()) + " Server is listening on port "
    + webSocketsServerPort);
});
var wsServer = new webSocketServer({
  httpServer: server,
  maxReceivedFrameSize: 1*1024*1024,
  maxReceivedMessageSize: 10 * 1024 * 1024
});
wsServer.on('request', function (request) {
  console.log((new Date()) + ' Connection from origin '
    + request.origin + '.');
  var connection = request.accept(null, request.origin);
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      //console.log((new Date()) + ' Received Message from ' + connection.remoteAddress + ': ' + message.utf8Data);
      var payload = JSON.parse(message.utf8Data);
      if (payload.role === 'client') {
        if (payload.type === 'register') {
          if (uidServerConns[payload.uid]) {
            var servConn = uidServerConns[payload.uid];
            //console.log(uidServerConns);
            if (servConn.key === payload.key) {
              uidClientConns[payload.uid] = connection;
              var initData = getDataFor("client", payload.uid);
              sendDataToClient(payload.uid, { type: 'init', data: initData });
              sendDataToServer(payload.uid, { type: 'support-init' });
              conns[request.key] = { uid: payload.uid, connType: "client", conn: connection };
              //console.log(uidClientConns);
              return;
            }
          }
          connection.sendUTF(JSON.stringify({ type: 'error', data: "unauthorized" }));
          return;
        } else if (payload.type === 'data-input' && uidClientConns[payload.uid]) {
          sendDataToServer(payload.uid, { type: 'client-update', data: payload });
        } else if (payload.type === 'data-action' && uidClientConns[payload.uid]) {
         sendDataToServer(payload.uid, { type: 'client-update', data: payload });
          data[payload.uid].forEach((obj, idx) => {
            if (obj.eleName === payload.eleName) {
              data[payload.uid].splice(idx,1);
              return;
            }
          });
         }
      } else if (payload.role === 'support') {
        if (payload.type === 'register') {
          if (uidServerConns[payload.uid]) {
            var servConn = uidServerConns[payload.uid];
            //console.log(uidServerConns);
            if (servConn.key === payload.key) {
              uidSupportConns[payload.uid] = connection;
              var initData = getDataFor("support", payload.uid);
              sendDataToSupport(payload.uid, { type: 'init', data: initData });
              sendDataToServer(payload.uid, { type: 'support-init' });
              conns[request.key] = { uid: payload.uid, connType: "support", conn: connection };
              //console.log(uidSupportConns);
              return;
            }
          }
          connection.sendUTF(JSON.stringify({ type: 'error', data: "unauthorized" }));
          return;
        } 
      } else if (payload.role === 'server') {
        
        if (payload.type === 'register') {
          const uid = guid();
          payload.uid=uid;
          var rkey = (Math.random() * Math.random() * Math.random() * 8425697) + "7";
          var finalKey = "" + (parseInt(rkey.substr(0, 6)) + parseInt(rkey.substr((rkey.length - 6), 6)));
          uidServerConns[payload.uid] = { conn: connection, key: finalKey, height:payload.height, width: payload.width, sharedWith: payload.sharedWith};
          conns[request.key] = { uid: payload.uid, connType: "server", conn: connection };
          sendDataToServer(payload.uid, { type: 'server-key', data: finalKey , uid});
          return;
        } else if (payload.type === 'server-terminated') {
          cleanupAfterServerSession(payload.uid, 'server-terminated');
          return;
        } else if (payload.type === 'email') {
          emailLink(payload.to, payload.link);
          return;
        }
        if(payload.type==='content')
          console.log('received image');
        if (!data[payload.uid]) {
          data[payload.uid] = [];
        }
        var foundIdx = -1;
        data[payload.uid].forEach((obj, idx) => {
          if (obj.eleName === payload.eleName) {
            populateData(payload, obj)
            foundIdx = idx;
          }
        });
        if (foundIdx === -1) {
          data[payload.uid].push(populateData(payload));
        }
        var action = "update";
        if ((payload.evtType === 'focusout' ||
          (payload.type === 'delegate' && !payload['allow-data-input']))
          && payload.eleVal === '') {
          data[payload.uid].splice(foundIdx, 1);
          action = "remove";
        }
        //console.log(data);
        if (uidClientConns[payload.uid] && payload.evtFor === "client") {
          console.log('sending to client');
          sendDataToClient(payload.uid, Object.assign(payload, { action }));
        }
        
        if (uidSupportConns[payload.uid] && (payload.evtFor === "support" || payload.type==="replicate")) {
          sendDataToSupport(payload.uid, Object.assign(payload, { action }));
        }
      }
    }
  });
  connection.on('close', function (connection) {
    try {
      console.log((new Date()) + " Peer "
        + connection.remoteAddress + " disconnected.");
      //console.dir(connection);
      //console.dir(request);
      if (conns[request.key]) {
        var d = conns[request.key];
        if (d.connType === 'client' && uidServerConns[d.uid]) {
          sendDataToServer(d.uid, { type: 'client-disconnected' });
          delete uidClientConns[d.uid];
          delete d.conn;
        } else if (d.connType === 'support' && uidServerConns[d.uid]) {
          sendDataToServer(d.uid, { type: 'support-disconnected' });
          delete uidSupportConns[d.uid];
          delete d.conn;
        } 
      }
    } catch (e) {
      console.error(e);
    }
  });
});
