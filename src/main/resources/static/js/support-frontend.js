$(function () {
    "use strict";
    var serverName = "localhost";
    //serverName = "mn-c02v61vbhtd8";
    var data = [];
    var lastEle = null;
    var uid = '', authKey = '';
    var connection = null;
    var popupId = '';
    var popup ;
    
    var populateData = function (payload, obj) {
      if (!obj) {
        return payload;
      }
      obj.eleVal = payload.eleVal;
      obj.role = payload.role;
      obj['allow-data-input'] = payload['allow-data-input'];
      obj.eleName = payload.eleName;
      obj.eleType = payload.eleType;
      obj.evtType = payload.evtType;
      obj.type = payload.type;
      obj.uid = payload.uid;
      obj.eleLabel = payload.eleLabel;
    }
    var renderContent = function () {
      var content = "";
      if (data.length > 0) {
        data.forEach(function(obj) {
          if(obj.eleType!=="radio"){
            $("#"+obj.eleName).val(obj.eleVal);
          }
        });
      } 
    }
  
    var connectToServer = function (uid, key) {
      if (uid !== '' && key!= '') {
        var evtData = { role: 'support', type: 'register', uid:uid , key:key};
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        if (!window.WebSocket) {
          content.html($('<p>',
            { text: 'Sorry, but your browser doesn\'t support WebSocket.' }
          ));
          return;
        }
        //connection = new WebSocket('ws://live-revue.us-east-1.elasticbeanstalk.com ');
        connection = new WebSocket('ws://'+serverName+':1980');
        connection.onopen = function () {
          connection.send(JSON.stringify(evtData));
        };
        connection.onerror = function (error) {
          content.html($('<p>', {
            text: 'Sorry, but there\'s some problem with your '
            + 'connection or the server is down.'
          }));
        };
        connection.onmessage = function (message) {
          try {
            var json = JSON.parse(message.data);
          } catch (e) {
            console.log('Invalid JSON: ', message.data);
            return;
          }
          if (json.type === 'replicate') {
            if (json.data)
              $(document.body).html(json.data);
              $(document).scrollTop(json.scrollTop);
              $(document).scrollLeft(json.scrollLeft);
          } else if (json.type === 'init') {
            if (json.data)
              data = json.data;
          } else if (json.type === 'error' && json.data === 'unauthorized') {
            $("#content").html("<div class='alert alert-danger'>Error occured, Unauthorized access.</div>");
            connection.close();
            return;
          } else if (json.type === 'server-disconnected') {
            $("#content").html("<div class='alert alert-danger'>Agent disconnected. Please contact the agent to get access again.</div>");
            connection.close();
            return;
          } else if (json.type === 'server-terminated') {
            $("#content").html("<div class='alert alert-danger'>Agent terminated the session.</div>");
            connection.close();
            return;
          } else {
            lastEle = json.eleName;
            var foundIdx = -1;
            data.forEach(function(obj, idx){
              if (obj.eleName === json.eleName) {
                if (json.eleVal === "" && json.action === "remove")
                  data.splice(idx, 1);
                else
                  populateData(json, obj);
                foundIdx = idx;
              }
            });
            if (foundIdx === -1) {
              data.push(populateData(json));
            }
          }
          renderContent();
        };
        document.documentElement.style.pointerEvents="none";
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.userSelect = 'none';
        
      }
    };
      if(window.location.pathname.indexOf('liveView.html')!==-1 && 
          window.location.hash.indexOf("#")!==-1 &&
          window.location.hash.split('#').length===4){
        uid = window.location.hash.split('#')[2];
        authKey = window.location.hash.split('#')[3];
        connectToServer(uid, authKey);
      }else if(window.location.hash.indexOf("#")!==-1){
        uid = window.location.hash.replace('#', '');
        $("#uid").val(uid);
        $("#uid").attr('disabled', 'disabled');
        $("#sessionIdDiv").hide();
      } 
  
    $("#btnView").click(function (e) {
      //connectToServer($("#uid").val(), $("#key").val());
      jQuery.get('/s/c?uid='+$("#uid").val()+'&key='+$("#key").val(), function( data ) {
        if(data.status ==='auth-error'){
          $("#content").html("<div class='alert alert-danger'>Error occured, Unauthorized access.</div>");
        }else if(data.status ==='success'){
          let coords = data;
          popup = window.open('./liveView.html#p#'+$("#uid").val()+'#'+$("#key").val(),''
            ,"width="+coords.width+",height="+coords.height+
                ",resizable=no,menubar=no,titlebar=no,scrollbars=no,toolbar=no,location=no,status=no");
          $("#register").hide(); 
          $("#content").html("<div class='alert alert-danger'>Please make sure that the popup blocker is enabled. Do not close this window.</div>");
        }
      });
      
    });
    $(document).on('blur', '.allow-input', function (e) {
      console.log(this);
      if (!$(this).hasClass('allow-input'))
        return;
      var id = $(this).attr('id').replace('input-', '');
      var currentObjArr = data.filter(function(obj){  
        obj.eleName === id
      });
      if (currentObjArr && currentObjArr.length > 0) {
        var currentObj = currentObjArr[0];
        var evtData = {
          role: 'client',
          uid: currentObj.uid,
          eleName: currentObj.eleName,
          eleVal: $(this).val(),
          eleType: currentObj.eleType,
          "allow-data-input": currentObj["allow-data-input"],
          type: 'data-input'
        };
        connection.send(JSON.stringify(evtData));
      }
    });
    $(document).on('click', '.btnPopup', function (e) {
      console.log(this);
      if (!$(this).hasClass('btnPopup'))
        return;
      var consent = $(this).hasClass("btnYes");
      var currentObjIdx = data.findIndex(function(obj){
        obj.eleName === popupId
      });
      if(currentObjIdx>-1){
        var currentObj = data[currentObjIdx];
        data.splice(currentObjIdx,1);
        var evtData = {
          role: 'client',
          uid: currentObj.uid,
          eleName: currentObj.eleName,
          eleVal: consent,
          eleType: currentObj.eleType,
          "allow-data-input": currentObj["allow-data-input"],
          type: 'data-action'
        };
        connection.send(JSON.stringify(evtData));
      }
    });
    
  
  });
  