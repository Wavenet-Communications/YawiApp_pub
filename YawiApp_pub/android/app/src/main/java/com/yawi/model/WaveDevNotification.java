package com.yawi.model;

import com.google.gson.annotations.Expose;

import java.util.Date;

public class WaveDevNotification {

    public static int ENotifyType_Connect = 0;
    public static int ENotifyType_Disconnect = 1;
    public static int ENotifyType_BattLow = 2;
    public static int ENotifyType_None = -1;

    @Expose
    public String mDevId;
    @Expose
    public String mDevName;
    @Expose
    public int mType;
    @Expose
    public long mTime;
    @Expose
    public boolean mRead;
    @Expose
    public String mMessage;

    public String getDevId() {
        return mDevId;
    }

    public void setDevId(String aDevId) {
        mDevId = aDevId;
    }

    public String getDevName() {
        return mDevName;
    }

    public void setDevName(String aDevName) {
        mDevName = aDevName;
    }

    public int getType() {
        return mType;
    }

    public void setType(int aType) {
        mType = aType;
    }

    public long getTime() {
        return mTime;
    }

    public void setTime(long aTime) {
        mTime = aTime;
    }

    public boolean isRead() {
        return mRead;
    }

    public void setRead(boolean aRead) {
        mRead = aRead;
    }

    public String getMessage() {
        return mMessage;
    }

    public void setMessage(String aMessage) {
        mMessage = aMessage;
    }

    public static WaveDevNotification buildNotifcation(WaveDevice aDevice, int aNotifyType) {
        WaveDevNotification lNotif  = new WaveDevNotification();
        lNotif.mDevId = aDevice.getDevId();
        lNotif.mDevName = aDevice.getDevName();
        lNotif.mType = aNotifyType;
        lNotif.mRead = false;
        lNotif.mTime = new Date().getTime();
        if (aNotifyType == ENotifyType_Connect){
            lNotif.mMessage = String.format("Device with '%s' is connected", lNotif.mDevId);
        }else if( aNotifyType == ENotifyType_Disconnect){
            lNotif.mMessage = String.format("Device with '%s' is disconnected", lNotif.mDevId);
        }else{
            lNotif.mMessage = String.format("Device '%s' unknown message ", lNotif.mDevId);
        }


        return lNotif;
    }


}
