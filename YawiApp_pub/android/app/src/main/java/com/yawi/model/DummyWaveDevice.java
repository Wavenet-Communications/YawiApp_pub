package com.yawi.model;

import com.facebook.react.bridge.ReactContext;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.minew.device.MinewDevice;
import com.minew.device.MinewDeviceManager;
import com.yawi.SOSManager.SosHandler;
import com.yawi.utils.Utils;

import androidx.annotation.NonNull;


public class DummyWaveDevice extends WaveDevice {

    public static final String DummyID = "PhoneId";

    public static boolean isDummyDevice(String aDevId) {
        return (aDevId.equals(DummyID));
    }

    public DummyWaveDevice(@NonNull MinewDeviceManager aDevManager, @NonNull ReactContext context) {
        super(aDevManager, context);
        mDevName = getDevName();
        mIsInSosMode = true;

    }

    @Override
    public String getDevId() {
        return DummyID;
    }

    @Override
    public String getDevName() {
        return "My phone";
    }

    @Override
    public void setDevName(String aDevName) {

    }

    @Override
    public boolean isInSosMode() {
        return mIsInSosMode;
    }
    @Override
    public void activateDevice(){ }

    @Override
    public boolean isDeviceActive(){ return false;}

    @Override
    public void deactivateDevice() { }

    @Override
    public void makeDeviceReady() {}


    @Override
    public void setSosHandler(SosHandler aSosHandler) {
        mSosHandler = aSosHandler;
    }

    @Override
    public void applyDefaultConfig(){}


    @Override
    public void startListening() {}

    @Override
    public void setDevice(@NonNull MinewDevice aDevice){}


    @Override
    public Utils.LatLng getLastLocation() { return new Utils.LatLng("0.0","0.0");}

    @Override
    public void setLastLocation(String aLastLocation){}

    @Override
    public  String getTimeStamp() {return "";}
    @Override
    public void setTimeStamp(String aTimeStamp) {}

    @Override
    public String getCategory() {return "";}

    @Override
    public void setCategory(String aCategory) {}

    @Override
    public String getIcon() {return "";}

    @Override
    public void setIcon(String aIcon) {}

    @Override
    public void setSosMode(boolean aFlag) {}


    @Override
    public void bindDevice() {}


    @Override
    public boolean isBinded() { return true;}
    @Override
    public  void unbindDevice() {}


    @Override
    public void searchDevice() {}
    @Override
    public void cancelSearchDevice() {}

    @Override
    public String getDevInfoAsJsonString() {

        WaveDeviceEntity lInfo = new WaveDeviceEntity();
        lInfo.mac = getDevId();
        lInfo.name = getDevName();

        lInfo.rssi = 0;
        lInfo.mode = 0;
        lInfo.distance = 1;
        lInfo.battery = 100;
        lInfo.bindState = true;
        lInfo.disappearTime = "";
        lInfo.disappearLong = 0;
        lInfo.disappearLat = 0;
        lInfo.connectionState = true;
        lInfo.devLoseAlert = false;
        lInfo.searchDev = false;
        lInfo.appAlert = false;
        lInfo.featureSupport = false;

        lInfo.alarmDist = 0;
        lInfo.alaramDelay = 0;
        lInfo.sosModeState = true;

        GsonBuilder builder = new GsonBuilder();
        Gson gson = builder.create();
        String jsonString = gson.toJson(lInfo);
        return jsonString;
    }

}
