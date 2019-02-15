var allControls = false;
var publishAllControls = function(flag) {
    allControls = flag;
}
//
//
/*
var jqscript = document.createElement('script');
jqscript.src = "https://code.jquery.com/jquery-3.3.1.min.js";
document.head.append(jqscript);
*/

$(function() {
    "use strict";
    var port = ":8080";
    var serverName = "localhost";
    //serverName = "mn-c02v61vbhtd8";
    
    var excludeEle = ['shareLink', 'custEmail', 'chk-'];
    var allInput = $('input');
    var allSelect = $('select');
    var input = $('.show-data');
    var chk = $('.get-data');
    var chklabel = $('.get-data-label');
    var btn = $('.btnContent');
    var supportMode = true;
    var clientMode = false;
    var sharedRole = "Customer";
    var clientNum = -1;
    var key = '';
    var sessionStatus = "not-started";
    var shareLink = "http://"+serverName+port+"/client.html#";
    var shareSupportLink = "http://"+serverName+port+"/support.html#";
    var stompClient = null;
    var uid = null;

    chk.hide();
    chklabel.hide();
    btn.hide();
    $(document.head).append('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">');
    $(document.head).append('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css">');
    $(document.head).append('<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>');
    $(document.head).append('<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script>');
    $(document.head).append('<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script>');
    $(document.head).append('<script src="https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.1.4/sockjs.min.js"></script>');
    $(document.head).append('<script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>');
    $(document.head).append('<link rel="stylesheet" href="../css/2gather.css">');

    $(document.body).prepend(
        '<div style="position: absolute;z-index: 9999;width:100%;height:60px" id="mydiv" >' +
            '<span id="controlPanel">&nbsp;</span>'+
            '<div id="guid"></div>'+
            '<div id="banner"></div>'+
        '<div>'
    );
    var guid = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        //return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        return s4() + s4() + s4() + s4() + s4() + s4();
    }
    
    uid = guid();
    
    var showStartSession = function() {
        $($("#controlPanel").parent()[0]).removeClass("alert alert-warning");
        $("#controlPanel").html(
            //'<div class="col-sm-6 mb-3">&nbsp;</div>'+
            '<div class="col-sm-6 mb-3 float-right">' +
                '<div class="btn-group float-right" >' +
                    '<button id="btnCustStart" type="button" class="btn btn-info" >' +
                        'Share With Customer' +
                    '</button> &nbsp; &nbsp;' +
                    '<button id="btnSupportStart" type="button" class="btn btn-warning" >' +
                        'Share With Support' +
                    '</button>' +
                '</div>' +
            '</div>'
        );
    }
    var showSessionInProgress = function() {
        $($("#controlPanel").parent()[0]).addClass("alert alert-warning");
        $("#controlPanel").html(
            '<span id="uid"></span>' +
            '<div class="btn-group float-right " id="btnEndGrp">' +
                '<button type="button" class="btn btn-outline-secondary faicon-secondary" id="btnPause">' +
                    '<i class="fas fa-pause"></i>' +
                '</button>' +
                '<button type="button" class="btn btn-outline-danger faicon-danger" id="btnEnd">' +
                    '<i class="fas fa-stop"></i>' +
                '</button>' +
                '<button type="button" class="btn btn-outline-primary faicon-primary" id="btnEmail">' +
                    '<i class="fas fa-share-alt"></i>' +
                '</button>' +
            '</div>' +
            '<div class="float-right" style="position: relative;z-index: 9999;width:290px;top:55px;right:-123px;background-color: paleturquoise;display:none;" id="shareDiv" > ' +
                '<div style="padding:5px;">' +
                    '<div class="float-left" style="padding:5px;">' +
                        '<input type="text" class="form-control form-control-sm" id="shareLink" size="25" readonly>' +
                    '</div>' +
                    '<div class="float-right tooltip1" style="padding:5px;">' +
                        '<button type="button" class="btn btn-outline-info faicon-info float-right" id="btnCopy" style="font-size:16px;padding:0px;width:28px;height:28px;">' +
                            '<span class="tooltiptext1" id="myTooltip">Copy link and share</span>' +
                            '<i class="fas fa-copy"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div style="padding:5px;">' +
                    '<div class="float-left" style="padding:5px;">' +
                        '<input type="text" style="z-index:99999" class="form-control form-control-sm" id="custEmail" placeholder="Enter E-mail ID to email" size="25">' +
                    '</div>' +
                    '<div class="float-right  tooltip1" style="padding:5px;">' +
                        '<button type="button" class="btn btn-outline-info faicon-info float-right" id="btnSend" style="font-size:16px;padding:0px;width:28px;height:28px;">' +
                            '<span class="tooltiptext1" id="myTooltip">Share link in Email</span>' +
                            '<i class="fas fa-paper-plane" alt="Send Email"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div style="padding:5px;">' +
                    '<div class="float-left" style="padding:5px;">' +
                        '<input type="text" style="z-index:99999" class="form-control form-control-sm" id="custEmail" placeholder="Enter Phone# to text" size="25">' +
                    '</div>' +
                    '<div class="float-right  tooltip1" style="padding:5px;">' +
                        '<button type="button" class="btn btn-outline-info faicon-info float-right" id="btnSend" style="font-size:16px;padding:0px;width:28px;height:28px;">' +
                            '<span class="tooltiptext1" id="myTooltip">Share link as Text</span>' +
                            '<i class="fas fa-mobile-alt" alt="Send Text"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div style="padding:5px;">' +
                    '<div class="float-left" style="padding:5px;">Key: ' +
                        '<span id="key"></span>' +
                    '</div>' +
                '</div>' +
            '<div>'
        );
    }
    $(document).on('click', '#btnEmail', function(){
        $("#shareDiv").toggle();
        $("#btnEmail").toggleClass("faicon-primary");
        $("#btnEmail").toggleClass("faicon-primary-active");
    });
    showStartSession();
    var getUIDFromSession = function(){
        return null;
    }
    var addUIDtoSession = function(){
    }
    var clearSession = function(guid){
    }
    var updateKeys = function(){
        shareLink += uid;
        shareSupportLink += uid;
        if (supportMode)
            $("#shareLink").val(shareSupportLink);
        else
            $("#shareLink").val(shareLink);
        $("#key").html(key);
    }
    $("#banner").hide(0);
    $("#guid").hide(0);
    $("#endRow").hide(0);
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t support WebSocket.' }));
        return;
    }
    var init = function(){
        if(supportMode){
            sharedRole = "Support Enigneer";
            window.onscroll = sendServersideEvent;
            $(document).on('scroll','div',sendServersideEvent);
        }else if(clientMode){
            sharedRole = "Customer";
            showSessionStyles();
        }
    }

    var clearSessionStyles = function() {
        $("#endRow").removeClass('alert alert-warning');
        input.removeClass('shared-field');
        disableSharableContent();
    }
    var showSessionStyles = function() {
        $("#endRow").addClass('alert alert-warning');
        input.addClass('shared-field');
        enableSharableContent();
    }
    var showStatusMsg = function() {
        var msg = '';
        if (sessionStatus === 'in-progress') {
            msg = "Session sharing in progress.";
        } else if (sessionStatus === 'paused') {
            msg = "Session sharing paused.";
        } else if (sessionStatus === 'terminated') {
            msg = "Session sharing terminated.";
        }
        if (clientNum === 0) {
            msg += " No "+sharedRole+" connected.";
        } else if (clientNum === 1) {
            msg += sharedRole+" connected.";
        } else if (clientNum > 1) {
            msg += " " + clientNum +" "+ sharedRole+"s connected.";
        }
        $("#uid").html(msg);
    }
    var connection = null;
    var getDocumentSnapshot = function() {
        var doc = $(document.body).html().replace(/<script>[\s\S]*?<\/script>/g, '');
        for(var i=0; i< $('style').length; i++){
            doc = $('style')[i].outerHTML+ doc;
        }
        return { role: 'server', sessionKey:uid, type: 'replicate', data: doc, scrollTop: $(document).scrollTop(), scrollLeft: $(document).scrollLeft() };
    }
    /////////////////////// START EVENT LISTENER/////////////////////
    // setInterval(function () {
    //   if (supportMode && sessionStatus === "in-progress" && connection!==null)
    //     connection.send(JSON.stringify(getDocumentSnapshot()));
    // }, 3000);

    // Options for the observer (which mutations to observe)
    var config = { attributes: true, childList: true, subtree: true };
    
    // Callback function to execute when mutations are observed
    var callback = function(mutationsList, observer) {
        sendServersideEvent();
    };
    var sendServersideEvent = function(){
        if (supportMode && sessionStatus === "in-progress" && stompClient !== null){
            //connection.send(JSON.stringify(getDocumentSnapshot()));
            stompClient.send("/app/activity.s.share/"+uid, {}, JSON.stringify(getDocumentSnapshot()));
        }
    }
    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(document.body, config);

    /////////////////////// END EVENT LISTENER/////////////////////
    $(document).on('click', '#btnPause', function(e) {
        if (sessionStatus === 'in-progress') {
            sessionStatus = "paused";
            $("#btnPause").addClass('btn-outline-success faicon-success');
            $("#btnPause").removeClass('btn-outline-secondary faicon-secondary');
            $($("#btnPause").children()[0]).removeClass('fa-pause');
            $($("#btnPause").children()[0]).addClass('fa-play');
        } else if (sessionStatus === 'paused') {
            sessionStatus = "in-progress";
            $("#btnPause").addClass('btn-outline-secondary  faicon-secondary');
            $("#btnPause").removeClass('btn-outline-success  faicon-success');
            $($("#btnPause").children()[0]).removeClass('fa-play');
            $($("#btnPause").children()[0]).addClass('fa-pause');
        }
        showStatusMsg();
    });
    $(document).on('click', '#btnEnd', function(e) {
        clientNum = -1;
        sessionStatus = "terminated";
        $("#btnEndGrp").hide();
        chk.hide();
        chklabel.hide();
        showStatusMsg();
        //connection.send(JSON.stringify({ role: 'server', type: 'server-terminated', uid:uid }));
        stompClient.send("/app/activity.s.share/"+uid, {}, JSON.stringify({ role: 'server', type: 'server-terminated', sessionKey:uid }));
        stompClient.disconnect(function(){
        	console.log('disconnected...');
        });
        //connection.close();
        clearSessionStyles();
        clearSession();
        
        //showStartSession();
    });
    $(document).on('click', '#btnSend', function(e) {
        var to = $("#custEmail").val();
        if (to !== '' && to !== undefined) {
            //connection.send(JSON.stringify({ role: 'server', type: 'email', uid:uid, to:to, link: shareLink }));
        	stompClient.send("/app/activity.s.share/"+uid, {}, JSON.stringify({ role: 'server', type: 'email', sessionKey:uid, to:to, link: shareLink }));
        }
    });
    var handleSessionStart = function() {
        showSessionInProgress();
        clientNum = 0;
        $("#startRow").hide(0);
        $("#endRow").show(0);
        $("#guid").html(uid);
        let height = window.innerHeight;
        let width = window.innerWidth;
        let sharedWith = supportMode?'s':clientMode?'c':'b';
        showStatusMsg();
        init();
        var initialConn = null;
        //connection = new WebSocket('ws://live-revue.us-east-1.elasticbeanstalk.com ');
        //connection = new WebSocket("ws://"+serverName+port);
        //connection = new WebSocket('ws://127.0.0.1:1980');
        
        
    	
    	function onMessageReceived(message) {
            try {
                var json = JSON.parse(message.body);
            } catch (e) {
                console.log('Invalid JSON: ', message.data);
                return;
            }
            if (json.type === 'client-update') {
                console.log(json);
                var val = json.eleVal;
                if ($("#chk-" + json.eleName).attr('data-mask') && $("#chk-" + json.eleName).attr('data-mask') === 'true') {
                    val = "*******";
                }
                $("#" + json.eleName).val(val);
                $("#" + json.eleName).addClass("focus-field");
                setTimeout(function() { $("#" + json.eleName).removeClass("focus-field"); }, 1000);
                $("#banner").html(getElementLabel(json.eleName) + " updated by customer.");
                $("#banner").fadeIn(100);
                $("#banner").fadeOut(4000);
            } else if (json.type === 'client-init') {
                clientNum++;
                showStatusMsg();
            } else if (json.type === 'support-init') {
                clientNum++;
                showStatusMsg();
                sendServersideEvent();
            } else if (json.type === 'client-disconnected') {
                clientNum--;
                showStatusMsg();
            } else if (json.type === 'server-key') {
                key = json.authKey;
                uid = json.sessionKey;
                initialConn.unsubscribe();
                initialConn = stompClient.subscribe('/activity/server/'+uid, onMessageReceived);
                
                //addUIDtoSession();
                updateKeys();
            }
        };
    
        
        function onConnected() {
        	
        	if(sessionStatus === "not-started"){
                //connection.send(JSON.stringify({ role: 'server', type: 'register', uid:uid , height:height, width:height,sharedWith:sharedWith}));
                sessionStatus = "in-progress";
                // Subscribe to the Public Topic
                initialConn = stompClient.subscribe('/activity/server/'+uid, onMessageReceived);
                // Tell your username to the server
                stompClient.send("/app/activity.s.register/"+uid,
                    {},
                    JSON.stringify({ role: 'server', type: 'register', uid:uid , height:height, width:height,sharedWith:sharedWith})
                );
            }
            chk.show();
            chklabel.show();
            btn.show();
        }


        function onError(error) {
//        	content.html($('<p>', {
//                text: 'Sorry, but there\'s some problem with your ' +
//                    'connection or the server is down.'
//            }));
        }


        
        
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);

        
        connection={};
    };
    
    
    
    
    $("#btnCustStart").click(function() {
        clientMode = true;
        supportMode = false;
        handleSessionStart();
    });
    $("#btnSupportStart").click(function() {
        clientMode = false;
        supportMode = true;
        handleSessionStart();
    });
    $(document).on('click', '#btnCopy', function(e) {
        //$("#btnCopy").click(()=>{
        var copyText = document.getElementById("shareLink");
        copyText.select();
        document.execCommand("copy");
    });
    var enableSharableContent = function(){
        $('.sharableContent').prepend(
            '<span style="width:100%" data-html2canvas-ignore>'+
                '<span class="aSharableContent small float-right shared-link">'+
                    'Share with Customer <i class="fas fa-share"></i>'+
                '</span>'+
            '</span>'
            );
        $('.sharableContent').addClass('shared-section');
    }
    var disableSharableContent = function(){
        $('.sharableContent span').html('');
        $('.sharableContent').removeClass('shared-section');
    }
    var getElementValue = function(e) {
        var eleType = e.target.type.toLowerCase();
        if (eleType === "checkbox")
            return e.target.checked;
        else if (eleType === "text")
            return e.target.value;
        else if (eleType === "select-one")
            return e.target.selectedOptions[0].text;
        else if (eleType === "radio")
            return getElementLabel(e.target.id);
        else
            return "";
    }
    var getElementName = function(e) {
        var eleType = e.target.type.toLowerCase();
        if (eleType === "radio")
            return e.target.name;
        else
            return e.target.id;
    }
    var getElementLabel = function(id, type, name, resolved) {
        var label = id;
        var tempLabel = '';
        if(type==='radio' && !resolved){
            tempLabel = getElementLabel(name, type, name, true);
        }
        if(tempLabel==='')
            tempLabel = $('label[for="' + id + '"]').html();

        if (tempLabel && tempLabel !== '') {
            label = tempLabel;
        } else if ($("#" + id).attr('data-label'))
            label = $("#" + id).attr('data-label');
        else if ($("#" + id) && $("#" + id).length > 0 &&
            $("#" + id)[0].labels && $("#" + id)[0].labels.length > 0 && $("#" + id)[0].labels[0].innerHTML && $("#" + id)[0].labels[0].innerHTML !== '') {
            label = $("#" + id)[0].labels[0].innerHTML;
        }
        return label;
    }
    var sendData = function(evtFor, eleName, eleVal, eleType, evtType, eleLabel, allowInput, type) {
        var evtData = { role: 'server', sessionKey:uid, evtFor:evtFor, eleName:eleName, eleVal:eleVal, 
                            eleType:eleType, evtType:evtType, eleLabel:eleLabel, allowEdit: !!allowInput, type:type };
        if (sessionStatus === "in-progress"){
            //connection.send(JSON.stringify(evtData));
        	stompClient.send("/app/activity.s.share/"+uid, {}, JSON.stringify(evtData));
            //addUIDtoSession();
        }
    }
    var isIgnorePattern = function(eleType, eleName, evtType){
        let ret = false;
        if(eleType==='button'||eleType==='submit')
            return true;
        excludeEle.forEach(function(igEle){
            ret=ret||eleName.indexOf(igEle)!==-1
        });
        
        return ret;
    }
    var publishEvent = function(e) {
        var eleType = e.target.type.toLowerCase();
        var evtType = e.type;
        var eleLabel = getElementLabel(e.target.id, eleType, getElementName(e), false);
        var eleVal = getElementValue(e);
        var eleName = getElementName(e);
        if(isIgnorePattern(eleType,eleName,evtType))
            return;
            
        sendData("client", eleName, eleVal, eleType, evtType, eleLabel);
    }
    var publishSupportEvent = function(e) {
        if (!supportMode)
            return;
        var eleType = e.target.type.toLowerCase();
        var evtType = e.type;
        var eleLabel = getElementLabel(e.target.id);
        var eleVal = getElementValue(e);
        var eleName = getElementName(e);
        sendData("support", eleName, eleVal, eleType, evtType, eleLabel);
    }

    var publishGetDataEvent = function(e) {
        var evtType = e.type;
        var eleVal = getElementValue(e);
        var targetId = e.target.id.replace('chk-', '');
        var targetLabel = getElementLabel(targetId);
        var targetType = $('#' + targetId).attr('type');
        var targetVal = $('#' + targetId).val();
        var eleMask = $(this).attr('data-mask');
        var eleName = getElementName(e);
        sendData("client", targetId, targetVal, targetType, evtType, targetLabel, eleVal, "delegate");
    }
    var publishGetActionEvent = function(e) {
        var evtType = e.type;
        var contentId = $(this).attr('data-content-id');
        var targetId = $(this).attr('data-target-id');
        var targetInitials = $(this).attr('data-target-initials');
        var content = $('#' + contentId).html();
        var eleName = getElementName(e);
        //(eleName, eleVal, eleType, evtType, eleLabel, allowInput, type) 
        sendData("client", targetId, '', 'link', evtType, content, true, "action");
    }
    var publishContentShareEvent = function(e) {
        let evtType = e.type;
        let divContent = $(this).parent().parent().html();
        let spanContent = $(this).parent().html();
        let content = divContent.replace(spanContent,'');
        let eleName = ""+new Date().getTime();
        let eleHeight= $(this).parent().parent()[0].offsetHeight;
        let eleWidth= $(this).parent().parent()[0].offsetWidth;
        $(this).attr('data-uid',eleName);
        $(this).html('Currently shared, Clear <i class="fas fa-times-circle">');
        console.log(connection);
         html2canvas($(this).parent().parent()[0]).then(function(canvas){
             var myImage = canvas.toDataURL("image/jpeg", 1);
        //     //console.log(myImage);
        //     //window.open(myImage,'_blank');
             var image = new Image();
             image.src = myImage;
             image.height=eleHeight;
             image.width=eleWidth;
             //var w = window.open("");
             //w.document.write(image.outerHTML);
        //     //evtFor, eleName, eleVal, eleType, evtType, eleLabel, allowInput, type
             sendData("client", eleName, eleWidth+'#'+eleHeight, 'content', evtType, myImage, false, "view");
        //     console.log(connection);
        });
       
        return false;
    
    }

    function dragElement(elmnt) {
        var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            $("#mydiv").css('top', ($("#mydiv").offset().top - pos2) + "px");
            $("#mydiv").css('left', ($("#mydiv").offset().left - pos1) + "px");
            //elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            //elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
        function closeDragElement() {
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
        }
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
        if ($("#" + elmnt + "header").length > 0) {
            $(document).on('mousedown', "#" + elmnt + "header", dragMouseDown);
        } else {
            $(document).on('mousedown', "#" + elmnt, dragMouseDown);
        }
    }

    //Make the DIV element draggagle:
    dragElement("mydiv");

    // $(document).on('blur', '.c-form-field__input', publishEvent);
    // $(document).on('keyup', '.c-form-field__input', publishEvent);
    // $(document).on('click', '.c-form-field__input', publishEvent);
    // $(document).on('focus', '.c-form-field__input', publishEvent);
    // $(document).on('blur', '.c-dropdown__menu', publishEvent);
    // $(document).on('keyup', '.c-dropdown__menu', publishEvent);
    // $(document).on('click', '.c-dropdown__menu', publishEvent);
    // $(document).on('focus', '.c-dropdown__menu', publishEvent);
    // $(document).on('blur', '.c-option__label__input', publishEvent);
    // $(document).on('keyup', '.c-option__label__input', publishEvent);
    // $(document).on('click', '.c-option__label__input', publishEvent);
    // $(document).on('focus', '.c-option__label__input', publishEvent);
    // $(document).on('blur', '.c-button-group__item__input', publishEvent);
    // $(document).on('keyup', '.c-button-group__item__input', publishEvent);
    // $(document).on('click', '.c-button-group__item__input', publishEvent);
    // $(document).on('focus', '.c-button-group__item__input', publishEvent);
    // $(document).on('blur', '.c-button-group__item__input', publishEvent);
    // $(document).on('keyup', '.c-button-group__item__input', publishEvent);
    // $(document).on('click', '.c-button-group__item__input', publishEvent);
    // $(document).on('focus', '.c-button-group__item__input', publishEvent);
    // $(document).on('blur', '.c-button-group__item__input', publishEvent);
    // $(document).on('keyup', '.c-button-group__item__input', publishEvent);
    // $(document).on('click', '.c-button-group__item__input', publishEvent);
    // $(document).on('focus', '.c-button-group__item__input', publishEvent);


    if (allControls) {
        $(document).on('blur', 'input', publishEvent);
        $(document).on('keyup', 'input', publishEvent);
        $(document).on('click', 'input', publishEvent);
        $(document).on('focus', 'input', publishEvent);
        $(document).on('blur', 'select', publishEvent);
        $(document).on('keyup', 'select', publishEvent);
        $(document).on('click', 'select', publishEvent);
        $(document).on('focus', 'select', publishEvent);
    } else {
        $(document).on('blur', '.show-data', publishEvent);
        $(document).on('keyup', '.show-data', publishEvent);
        $(document).on('click', '.show-data', publishEvent);
        $(document).on('focus', '.show-data', publishEvent);
    }
    $(document).on('blur', 'input', publishSupportEvent);
    $(document).on('keyup', 'input', publishSupportEvent);
    $(document).on('click', 'input', publishSupportEvent);
    $(document).on('focus', 'input', publishSupportEvent);
    $(document).on('blur', 'select', publishSupportEvent);
    $(document).on('keyup', 'select', publishSupportEvent);
    $(document).on('click', 'select', publishSupportEvent);
    $(document).on('focus', 'select', publishSupportEvent);
    $(document).on('click','.aSharableContent',publishContentShareEvent);
    chk.click(publishGetDataEvent);
    btn.click(publishGetActionEvent);
    $(document).on('click', '.get-data', publishGetDataEvent);
    $(document).on('click', '.btnContent', publishGetActionEvent);
});
