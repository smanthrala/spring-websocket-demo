package com.example.websocketdemo.model;

import java.util.LinkedHashMap;
import java.util.List;

/**
 * Created by rajeevkumarsingh on 24/07/17.
 */
public class ActivityMessage {
	//{"role":"server","uid":"cd2f0611d2eb4b89937149dc4588a96f","evtFor":"client","eleName":"lastName","eleVal":"",
	//"eleType":"text","evtType":"focusout","eleLabel":"Last name","allow-data-input":false}
    private String role;
    private String type;
    private String clientKey;
    private String sessionKey;
    private String authKey;
    private String sharedWith;
    private String evtType;
    private String eleName;
    private String eleVal;
    private String eleLabel;
    private Boolean allowEdit;
    private String evtFor;
    private String eleType;
    private String to;
    private String link;
    
    private String data ;
    private LinkedHashMap<String,ActivityMessage> initData ;
    
    
    private String height;
    private String width;
    private String scrollTop;
    private String scrollLeft;
    
    
    private String status;
    private String action;
    
    
    
    
    
	public String getAction() {
		return action;
	}
	public void setAction(String action) {
		this.action = action;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public LinkedHashMap<String,ActivityMessage> getInitData() {
		return initData;
	}
	public void setInitData(LinkedHashMap<String,ActivityMessage> initData) {
		this.initData = initData;
	}
	public String getTo() {
		return to;
	}
	public void setTo(String to) {
		this.to = to;
	}
	public String getLink() {
		return link;
	}
	public void setLink(String link) {
		this.link = link;
	}
	public String getData() {
		return data;
	}
	public void setData(String data) {
		this.data = data;
	}
	public String getScrollTop() {
		return scrollTop;
	}
	public void setScrollTop(String scrollTop) {
		this.scrollTop = scrollTop;
	}
	public String getScrollLeft() {
		return scrollLeft;
	}
	public void setScrollLeft(String scrollLeft) {
		this.scrollLeft = scrollLeft;
	}
	public String getEvtFor() {
		return evtFor;
	}
	public void setEvtFor(String evtFor) {
		this.evtFor = evtFor;
	}
	public String getEleType() {
		return eleType;
	}
	public void setEleType(String eleType) {
		this.eleType = eleType;
	}
	public String getEleLabel() {
		return eleLabel;
	}
	public void setEleLabel(String eleLabel) {
		this.eleLabel = eleLabel;
	}
	public String getClientKey() {
		return clientKey;
	}
	public void setClientKey(String clientKey) {
		this.clientKey = clientKey;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getSessionKey() {
		return sessionKey;
	}
	public void setSessionKey(String sessionKey) {
		this.sessionKey = sessionKey;
	}
	public String getAuthKey() {
		return authKey;
	}
	public void setAuthKey(String authKey) {
		this.authKey = authKey;
	}
	public String getSharedWith() {
		return sharedWith;
	}
	public void setSharedWith(String sharedWith) {
		this.sharedWith = sharedWith;
	}
	public String getEvtType() {
		return evtType;
	}
	public void setEvtType(String evtType) {
		this.evtType = evtType;
	}
	public String getEleName() {
		return eleName;
	}
	public void setEleName(String eleName) {
		this.eleName = eleName;
	}
	public String getEleVal() {
		return eleVal;
	}
	public void setEleVal(String eleVal) {
		this.eleVal = eleVal;
	}
	public Boolean getAllowEdit() {
		return allowEdit;
	}
	public void setAllowEdit(Boolean allowEdit) {
		this.allowEdit = allowEdit;
	}
	public String getHeight() {
		return height;
	}
	public void setHeight(String height) {
		this.height = height;
	}
	public String getWidth() {
		return width;
	}
	public void setWidth(String width) {
		this.width = width;
	}
    
    
    

    
}
