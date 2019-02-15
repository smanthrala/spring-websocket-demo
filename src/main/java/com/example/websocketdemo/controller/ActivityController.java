package com.example.websocketdemo.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.example.websocketdemo.model.ActivityMessage;

@Controller
public class ActivityController {
	
	Map<String, LinkedHashMap<String,ActivityMessage>> dataMap = new HashMap<String, LinkedHashMap<String,ActivityMessage>>();
	Map<String, ActivityMessage> serverMap = new HashMap<String, ActivityMessage>();
	
    @MessageMapping("/activity.s.register/{clientKey}")
    @SendTo("/activity/server/{clientKey}")
    public ActivityMessage registerServer(@Payload ActivityMessage activityMessage,
                               SimpMessageHeaderAccessor headerAccessor, @DestinationVariable String clientKey) {
    	String sessionKey = generateSessionKey();
        String authkey = generateAuthKey();

    	activityMessage.setSessionKey(sessionKey);
    	activityMessage.setClientKey(clientKey);
    	
    	activityMessage.setAuthKey(authkey);
        activityMessage.setType("server-key");
        
        headerAccessor.getSessionAttributes().put("username", "S"+activityMessage.getSessionKey());
    	serverMap.put(sessionKey, activityMessage);
        return activityMessage;
    }
    
    @MessageMapping("/activity.c.register/{sessionKey}")
    @SendTo("/activity/client/{sessionKey}")
    public ActivityMessage registerClient(@Payload ActivityMessage activityMessage,
                               SimpMessageHeaderAccessor headerAccessor, @DestinationVariable String sessionKey) {
    	
    	if(!validateKeys(activityMessage.getSessionKey(), activityMessage.getAuthKey())) {
    		activityMessage.setStatus("auth-error");
    		activityMessage.setType("error");
    		activityMessage.setData("unauthorized");
    		return activityMessage;
    	}
    	
    	populateServerHeightWidth(activityMessage);
    	
    	
        // Add username in web socket session
    	headerAccessor.getSessionAttributes().put("username", "C"+activityMessage.getSessionKey());
    	activityMessage.setType("init");
    	activityMessage.setStatus("success");

    	if(dataMap.containsKey(sessionKey))
    		activityMessage.setInitData(dataMap.get(sessionKey));
    	
    	ActivityMessage newMsg = new ActivityMessage();
    	newMsg.setType( "client-init");
    	
    	sendMessageToServer(newMsg, sessionKey);
    	
        return activityMessage;
    }
    
    @MessageMapping("/activity.s.share/{sessionKey}")
    @SendTo("/activity/client/{sessionKey}")
    public ActivityMessage sendMessageToClient(@Payload ActivityMessage activityMessage, @DestinationVariable String sessionKey) {
    	
    	if("server-terminated".equals(activityMessage.getType())) {
    		if(dataMap.containsKey(sessionKey))
    			dataMap.remove(sessionKey);
    		if(serverMap.containsKey(sessionKey))
    			serverMap.remove(sessionKey);
    		
    		activityMessage.setType("server-terminated");
    	}else {
    		
	    	if(!dataMap.containsKey(sessionKey)) {
	    		dataMap.put(sessionKey, new LinkedHashMap<String,ActivityMessage>());
	    	}
	    	dataMap.get(sessionKey).put(activityMessage.getEleName(),activityMessage);
    	}
    	activityMessage.setAction("update");
    	if(("focusout".equals(activityMessage.getEvtType()) || 
    			("delegate".equals(activityMessage.getType())&&(activityMessage.getAllowEdit()==null||!activityMessage.getAllowEdit())))
    			&& (activityMessage.getEleVal() == null || "".equals(activityMessage.getEleVal() ))) {
    		
    		
    		activityMessage.setAction("remove");
    		removeDataElement(activityMessage.getEleName(), sessionKey);
    	}
//    	var action = "update";
//        if ((payload.evtType === 'focusout' ||
//          (payload.type === 'delegate' && !payload['allow-data-input']))
//          && payload.eleVal === '') {
//          data[payload.uid].splice(foundIdx, 1);
//          action = "remove";
//        }
        
        
        return activityMessage;
    }

    @MessageMapping("/activity.c.share/{sessionKey}")
    @SendTo("/activity/server/{sessionKey}")
    public ActivityMessage sendMessageToServer(@Payload ActivityMessage activityMessage, @DestinationVariable String sessionKey) {
    	
    	if( "data-input".equals(activityMessage.getType()) ) {
    		activityMessage.setType("client-update");
        }else if( "data-action".equals(activityMessage.getType()) ) {
    		activityMessage.setType("client-update");
    		removeDataElement(activityMessage.getEleName(), sessionKey);
        }
    	
    	
        return activityMessage;
    }

	private void removeDataElement(String eleName, String sessionKey) {
		if(dataMap.containsKey(sessionKey)) {
			Map subdatamap = dataMap.get(sessionKey);
			if(subdatamap.containsKey(eleName)) {
				subdatamap.remove(eleName);
			}
		}
	}

    private String generateSessionKey() {
    	return java.util.UUID.randomUUID().toString().replaceAll("-","");
    }
    
    private String generateAuthKey() {
    	String s = (""+(Math.random() * Math.random()  ));
    	return(s.substring(s.length()-7,s.length()-1));
    }
    
    private void populateServerHeightWidth(ActivityMessage activityMessage) {
    	if(!"support".equals(activityMessage.getRole()))
    		return;
    	
    	String height="200", width="200";
    	if(serverMap.containsKey(activityMessage.getSessionKey()) && serverMap.get(activityMessage.getSessionKey()).getAuthKey().equals(activityMessage.getAuthKey())) {
  		  height = serverMap.get(activityMessage.getSessionKey()).getHeight();
  		  width = serverMap.get(activityMessage.getSessionKey()).getWidth();
  	  	}
    	activityMessage.setHeight(height);
    	activityMessage.setWidth(width);
    }
    
    private boolean validateKeys(String sessionKey, String authKey) {
    	return (serverMap.containsKey(sessionKey) && serverMap.get(sessionKey).getAuthKey().equals(authKey));
    }
    


}
