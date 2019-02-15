$(function () {
    "use strict";
    var port = ":8080";
    var serverName = "localhost";
    //serverName = "mn-c02v61vbhtd8";
    var data = [];
    var lastEle = null;
    var uid = '';
    var connection = null;
    var popupId = '';
    var stompClient = null;
    $("#key").focus();
    var populateData = function (payload, obj) {
      if (!obj) {
        return payload;
      }
      obj.eleVal = payload.eleVal;
      obj.role = payload.role;
      obj.allowEdit = payload.allowEdit;
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
        content += '<form>';
        data.forEach(obj => {
          var focusClassName = "", readonly = "readonly", enableClassName = "";
          if (obj.eleName === lastEle)
            focusClassName = "focus-field";
          if (obj.allowEdit) {
            readonly = "";
            enableClassName = "allow-input"
          }
          if(obj.type==='action'){
            $(".modal-body").html(obj.eleLabel);
            popupId = obj.eleName;
            $("#exampleModal").modal({show:true});
            return;
          }if(obj.type==='view' && obj.eleType==='content'){
            var image = new Image();
            image.src = obj.eleLabel;
            image.height=obj.eleVal.split('#')[1];
            image.width=obj.eleVal.split('#')[0];
            content+='<div class="form-group row">' +image.outerHTML+'</div>';
          }else{
            content += '<div class="form-group row">' +
              '<label for="input-' + obj.eleName + '" class="col-sm-3  col-form-label">' + obj.eleLabel + '</label>' +
              '<div class="col-sm-9">' +
              '<input type="text" class="form-control ' + focusClassName + ' ' + enableClassName + '" id="input-' + obj.eleName + '" value="' + obj.eleVal + '" ' + readonly + '/> ' +
              '</div></div>';
          }
        });
        content += '</form>';
        $("#content").html(content);
        $("#" + lastEle).focus();
      } else {
        $("#content").html('Session established, Stay tuned for updates!!!');
      }
    }
  
    var connectToServer = function (uid, key) {
      if (uid !== '' && key!= '') {
        var evtData = { role: 'client', type: 'register', sessionKey:uid , authKey:key};
        $("#register").hide(); 
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        if (!window.WebSocket) {
          content.html($('<p>',
            { text: 'Sorry, but your browser doesn\'t support WebSocket.' }
          ));
          return;
        }
        //connection = new WebSocket('ws://live-revue.us-east-1.elasticbeanstalk.com ');
        //connection = new WebSocket('ws://'+serverName+port);
        function onMessageReceived (message) {
          try {
            var json = JSON.parse(message.body);
          } catch (e) {
            console.log('Invalid JSON: ', message.data);
            return;
          }
          if (json.type === 'replicate') {
            if (json.data)
              $("#content").html(json.data);
            return;
          } else if (json.type === 'init') {
            if (json.initData){
            	var keys = Object.keys(json.initData);
            	keys.forEach(function(key){
            		data.push(json.initData[key]);
            	});
            }
          } else if (json.type === 'error' && json.data === 'unauthorized') {
            $("#content").html("<div class='alert alert-danger'>Error occured, Unauthorized access.</div>");
            stompClient.disconnect(function(){
            	console.log('disconnected...');
            });
            //connection.close();
            return;
          } else if (json.type === 'server-disconnected') {
            $("#content").html("<div class='alert alert-danger'>Agent disconnected. Please contact the agent to get access again.</div>");
            stompClient.disconnect(function(){
            	console.log('disconnected...');
            });
            //connection.close();
            return;
          } else if (json.type === 'server-terminated') {
            $("#content").html("<div class='alert alert-danger'>Agent terminated the session.</div>");
            stompClient.disconnect(function(){
            	console.log('disconnected...');
            });
            //connection.close();
            return;
          } else {
            lastEle = json.eleName;
            var foundIdx = -1;
            data.forEach((obj, idx) => {
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
        
        function onConnected() {
            //connection.send(JSON.stringify(evtData));
            stompClient.subscribe('/activity/client/'+uid, onMessageReceived);
            // Tell your username to the server
            stompClient.send("/app/activity.c.register/"+uid,
                {},
                JSON.stringify(evtData)
            );
          };
          function onError(error) {
            content.html($('<p>', {
              text: 'Sorry, but there\'s some problem with your '
              + 'connection or the server is down.'
            }));
          };
       
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);

      }
    };
   
    if(window.location.hash.indexOf("#")===-1){
      
    }else{
      uid = window.location.hash.replace('#', '');
      $("#uid").val(uid);
      $("#uid").attr('disabled', 'disabled');
          $("#sessionIdDiv").hide();
    }
    
  
    $("#btnView").click(function (e) {
      connectToServer($("#uid").val(), $("#key").val());
    });
    $(document).on('blur', '.allow-input', function (e) {
      console.log(this);
      if (!$(this).hasClass('allow-input'))
        return;
      var id = $(this).attr('id').replace('input-', '');
      var currentObjArr = data.filter(obj => obj.eleName === id);
      if (currentObjArr && currentObjArr.length > 0) {
        var currentObj = currentObjArr[0];
        var evtData = {
          role: 'client',
          uid: currentObj.uid,
          eleName: currentObj.eleName,
          eleVal: $(this).val(),
          eleType: currentObj.eleType,
          allowEdit: currentObj.allowEdit,
          type: 'data-input'
        };
        stompClient.send("/app/activity.c.share/"+uid,
                {},
                JSON.stringify(evtData)
        );
        //connection.send(JSON.stringify(evtData));
      }
    });
    $(document).on('click', '.btnPopup', function (e) {
      console.log(this);
      if (!$(this).hasClass('btnPopup'))
        return;
      var consent = $(this).hasClass("btnYes");
      var currentObjIdx = data.findIndex(obj => obj.eleName === popupId);
      if(currentObjIdx>-1){
        var currentObj = data[currentObjIdx];
        data.splice(currentObjIdx,1);
        var evtData = {
          role: 'client',
          uid: currentObj.uid,
          eleName: currentObj.eleName,
          eleVal: consent,
          eleType: currentObj.eleType,
          allowEdit: currentObj.allowEdit,
          type: 'data-action'
        };
        stompClient.send("/app/activity.c.share/"+uid,
                {},
                JSON.stringify(evtData)
        );
        //connection.send(JSON.stringify(evtData));
      }
    });
    
  
  });
  