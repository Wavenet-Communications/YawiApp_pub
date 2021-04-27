package com.yawi.model;


import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.yawi.R;
import com.yawi.SOSManager.SosHandler;
import com.yawi.service.SoundPlayerService;
import com.yawi.utils.InMinewDeviceInstanceCreator;
import com.yawi.utils.Utils;
import com.yawi.utils.WaveDeviceInstanceCreator;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.annotations.Expose;
import com.google.gson.reflect.TypeToken;
import com.minew.device.InMinewDevice;
import com.minew.device.MinewDevice;
import com.minew.device.MinewDeviceListener;
import com.minew.device.MinewDeviceManager;
import com.minew.device.MinewDeviceValue;
import com.minew.device.enums.DeviceLinkStatus;
import com.minew.device.enums.InstrucIndex;
import com.minew.device.enums.ValueIndex;
import com.minew.device.service.ConnectService;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;

import androidx.annotation.NonNull;



public class WaveDevice {


    // ENoneState -> EReadyState || EConnectingState
    // EReadyState -> EActiveState
    // EActiveState -> EReadyState || EConnectingState
    // EConnectingState -> EConnectedState
    // EConnectedState -> EDisconnectState
    // EDisconnectState -> EReadyState
    enum DeviceState {
        ENoneState,
        EReadyState,
        EConnectingState,
        EConnectedState,
        EDisconnectState
    }
    protected ReactContext mContext;
    @Expose
    public InMinewDevice mDevice;
    @Expose
    protected String      mDevName;
    @Expose
    protected String      mLastLocation;
    @Expose
    protected String      mTimeStamp;
    @Expose
    protected String      mCategory;
    @Expose
    protected String      mIcon;
    @Expose
    protected boolean     mIsInSosMode;

    protected String      mCurSearchStatus;

    protected Timer       mTimer;
    protected boolean     mIsActiveMode;

    protected MinewDeviceManager mDeviceManager;
    protected DeviceState               mDeviceState;
    protected SosHandler mSosHandler;


    private static final int TIMER_DELAY = 4 * 1000; // milliseconds;

    private MinewDeviceListener mDevListener;

    public  static String getDevId(MinewDevice aDevice){
        String mac = aDevice.getValue(ValueIndex.ValueIndex_MacAddress).getStringValue();
        return mac;
    }
    public WaveDevice(@NonNull MinewDeviceManager aDevManager, @NonNull ReactContext context, @NonNull String aJsonString){
        mContext = context;
        mDeviceManager = aDevManager;
        mDeviceState = DeviceState.ENoneState;
        initListener();
    }

    public WaveDevice(@NonNull MinewDeviceManager aDevManager, @NonNull ReactContext context, @NonNull MinewDevice device){
        this(aDevManager, context);
        mDevice = (InMinewDevice) device;
        initListener();
    }

    public WaveDevice(@NonNull MinewDeviceManager aDevManager, @NonNull ReactContext context){
        mContext = context;
        mDeviceManager = aDevManager;
        mDeviceState = DeviceState.ENoneState;
    }


    public void activateDevice(){

        assert (mDeviceState == DeviceState.EReadyState);
        mIsActiveMode = true;
        _loc_bindDevice();
    }

    public boolean isDeviceActive(){
        return mIsActiveMode;
    }
    public void deactivateDevice(){
        mIsActiveMode = false;
        mDeviceState = DeviceState.EReadyState;
        _loc_unbindDevice();
    }

    public void makeDeviceReady(){
        assert (mDeviceState == DeviceState.EDisconnectState || mDeviceState == DeviceState.ENoneState);
        mDeviceState = DeviceState.EReadyState;
    }

    private void startTimer(){
        if (mTimer == null){
            mTimer = new Timer();
            mTimer.schedule(new TimerTask() {
                @Override
                public void run() {
                    // TBD  : need to post this on to current thread handler
                    stopTimer();
                    if (mIsActiveMode){
                        cancelSearchDevice();
                        return;
                    }
                    mCurSearchStatus = "";

                    String mac = getDevId();
                    WritableMap lMap = Arguments.createMap();
                    String lEventType = "onDeviceSearch";
                    fillSearchData(lMap, mac);
                    Utils.sendEvent(mContext, lEventType, lMap);
                }
            }, TIMER_DELAY);
        }
    }
    protected void stopTimer(){
        if (mTimer != null){
            mTimer.cancel();
            mTimer = null;
        }
    }


    public void setSosHandler(SosHandler aSosHandler) {
        mSosHandler = aSosHandler;
    }

    public void applyDefaultConfig(){
        mDevice.setValue(MinewDeviceValue.index(ValueIndex.ValueIndex_Connected, false));
        mDevice.setValue(MinewDeviceValue.index(ValueIndex.ValueIndex_Bind, true));
        mDevice.setValue(MinewDeviceValue.index(ValueIndex.ValueIndex_AppLoseAlert, true));
        mDevice.setValue(MinewDeviceValue.index(ValueIndex.ValueIndex_DeviceLoseAlert, true));
        mDevice.setValue(MinewDeviceValue.index(ValueIndex.ValueIndex_AlarmDelay, 2));
    }

    public static List<WaveDevice> fromJsonString(String aJsonString, ReactContext aReactContext){

        Gson gson = (new GsonBuilder()).excludeFieldsWithoutExposeAnnotation()
                .registerTypeAdapter(WaveDevice.class, new WaveDeviceInstanceCreator(aReactContext))
                .registerTypeAdapter(InMinewDevice.class, new InMinewDeviceInstanceCreator())
                .create();
        Type lType = (new TypeToken<List<WaveDevice>>() {
        }).getType();
        ArrayList lDevices = gson.fromJson(aJsonString, lType);
        return lDevices;
    }

    public void startListening(){
        initListener();
        mDevice.setMinewDeviceListener(mDevListener);

    }
    public void setDevice(@NonNull MinewDevice aDevice){
        if(mDevice != null){
            // mDevice.setMinewDeviceListener(null);
        }
        mDevice = (InMinewDevice)aDevice;
        setDevName(mDevName);
    }

    public String getDevId(){
        String mac = mDevice.getValue(ValueIndex.ValueIndex_MacAddress).getStringValue();
        return mac;// mac
    }

    public String getDevName() {
        String name = mDevice.getValue(ValueIndex.ValueIndex_Name).getStringValue();
        if (name == null || name.equals("")){
            name = mDevName;
        }
        return name;
    }

    public void setDevName(String aDevName) {
        if(mDevice != null){
            mDevice.setValue(MinewDeviceValue.index(ValueIndex.ValueIndex_Name, aDevName));
        }
        mDevName = aDevName;
    }

    public Utils.LatLng getLastLocation() {
        return new Utils.LatLng(mDevice.getValue(ValueIndex.ValueIndex_DisappearLati).getStringValue(),
                mDevice.getValue(ValueIndex.ValueIndex_DisappearLong).getStringValue());
    }

    public void setLastLocation(String aLastLocation) {
        mLastLocation = aLastLocation;
    }

    public String getTimeStamp() {
        return mTimeStamp;
    }

    public void setTimeStamp(String aTimeStamp) {
        mTimeStamp = aTimeStamp;
    }

    public String getCategory() {
        return mCategory;
    }

    public void setCategory(String aCategory) {
        mCategory = aCategory;
    }

    public String getIcon() {
        return mIcon;
    }

    public void setIcon(String aIcon) {
        mIcon = aIcon;
    }
    public boolean isInSosMode() {
        return mIsInSosMode;
    }

    public void setSosMode(boolean aFlag) {
        mIsInSosMode = aFlag;
    }

    public String getDevInfoAsJsonString(){

        WaveDeviceEntity lInfo = new WaveDeviceEntity();
        lInfo.mac = mDevice.getValue(ValueIndex.ValueIndex_MacAddress).getStringValue();
        lInfo.name = getDevName();

        lInfo.rssi = mDevice.getValue(ValueIndex.ValueIndex_Rssi).getIntValue();
        lInfo.mode = mDevice.getValue(ValueIndex.ValueIndex_Mode).getIntValue();
        lInfo.distance = mDevice.getValue(ValueIndex.ValueIndex_Distance).getFloatValue();
        lInfo.battery = mDevice.getValue(ValueIndex.ValueIndex_Battery).getIntValue();
        lInfo.bindState = mDevice.getValue(ValueIndex.ValueIndex_Bind).isBool();
        lInfo.disappearTime = mDevice.getValue(ValueIndex.ValueIndex_DisappearTime).getStringValue();
        lInfo.disappearLong = mDevice.getValue(ValueIndex.ValueIndex_DisappearLong).getFloatValue();
        lInfo.disappearLat = mDevice.getValue(ValueIndex.ValueIndex_DisappearLati).getFloatValue();
        lInfo.connectionState = mDevice.getValue(ValueIndex.ValueIndex_Connected).isBool();
        lInfo.devLoseAlert = mDevice.getValue(ValueIndex.ValueIndex_DeviceLoseAlert).isBool();
        lInfo.searchDev = mDevice.getValue(ValueIndex.ValueIndex_Search).isBool();
        lInfo.appAlert = mDevice.getValue(ValueIndex.ValueIndex_AppLoseAlert).isBool();
        lInfo.featureSupport = mDevice.getValue(ValueIndex.ValueIndex_FeatureSupport).isBool();

        lInfo.alarmDist = mDevice.getValue(ValueIndex.ValueIndex_AlarmDistance).getIntValue();
        lInfo.alaramDelay = mDevice.getValue(ValueIndex.ValueIndex_AlarmDelay).getIntValue();
        lInfo.sosModeState = mIsInSosMode;
        lInfo.devImage = mIcon;

        GsonBuilder builder = new GsonBuilder();
        Gson gson = builder.create();
        String jsonString = gson.toJson(lInfo);
        return jsonString;
    }


    public void bindDevice(){
        if( mIsActiveMode){
            mIsActiveMode = false;
            cancelSearchDevice();
            stopTimer();
            return;
        }
        if(mDeviceState == DeviceState.ENoneState
                || mDeviceState == DeviceState.EConnectingState){

            mDeviceState = DeviceState.EConnectingState;
            _loc_bindDevice();
            return;
        }

    }

    private void _loc_bindDevice(){
        applyDefaultConfig();
        //mDevice.setValue(MinewDeviceValue.index(ValueIndex.ValueIndex_Connected, true));

        mDeviceManager.bindDevice(mDevice);
        mDeviceManager.connect(mDevice);
    }

    private void initListener(){

        if (mDevListener != null){
            return;
        }
        mDevListener = new MinewDeviceListener() {
            @Override
            public void onUpdateValue(MinewDevice aMinewDevice, MinewDeviceValue aMinewDeviceValue) {
                if (mIsActiveMode){
                    return;
                }

                String mac = getDevId();
                WritableMap map = Arguments.createMap();
                map.putString("DevID", mac);
                map.putString("DevDetails", getDevInfoAsJsonString());
                Utils.sendEvent(mContext,"onDeviceUpdateValue", map);
            }

            @Override
            public void onSendData(MinewDevice aMinewDevice, InstrucIndex aInstructIndex, boolean aB) {
                WritableArray devList = Arguments.createArray();

                String mac = getDevId();
                WritableMap lMap = Arguments.createMap();
                String lEventType = "onDeviceUpdateValue";
                switch (aInstructIndex){
                    case InstrucIndex_Search:
                        if (mIsActiveMode){

                            lEventType = "onDeviceActivation";
                            if(aB){
                                // activation success
                                lMap.putBoolean("success", true);
                            }else{
                                // activation fail
                                lMap.putBoolean("success", false);
                            }
                            startTimer();
                            Utils.sendEvent(mContext, lEventType, lMap);
                            return;
                        }
                        lEventType = "onDeviceSearch";
                        if(aB){
                            mCurSearchStatus = "Ringing...";
                        }else{
                            mCurSearchStatus = "Device not found";
                        }
                        fillSearchData(lMap, mac);

                        startTimer();
                        Utils.sendEvent(mContext, lEventType, lMap);
                        return;
                    case InstrucIndex_CancelSearch:
                        lEventType = "onDeviceCancelSearch";
                        return;
                }
                devList.pushMap(lMap);
                Utils.sendEvent(mContext, lEventType, devList);

            }


            @Override
            public void onReceiveInstructionfromDevice(InstrucIndex aInstrucIndex, MinewDevice aMinewDevice) {
                if (mIsActiveMode){
                    searchDevice();
                    return;
                }

                if (mIsInSosMode) {
                    Handler handelr = new Handler(Looper.getMainLooper());
                    handelr.post(()-> {
                        handleSosEvent();
                    });
                    return;
                }

                WritableArray devList = Arguments.createArray();

                String mac = getDevId();
                WritableMap map = Arguments.createMap();
                map.putString("DevID", mac);
                map.putString("DevDetails", getDevInfoAsJsonString());

                devList.pushMap(map);
                Utils.sendEvent(mContext,"onReceiveInstructionfromDevice", devList);
                switch (aInstrucIndex) {
                    case InstrucIndex_ButtonPushed:
                        Log.e("tag", "InstrucIndex_ButtonPushed");

                        Intent serviceIntent = new Intent();
                        SoundPlayerService.enqueueWork(mContext, serviceIntent);
                        break;
                }


            }
        };
    }

    private void handleSosEvent(){
        String eventStr = "onSOSDevicePressed";
        if (!mSosHandler.isSosStarted()) {
            mSosHandler.doSosOnTimeout( this);

        } else {
            mSosHandler.cancelSosTimeout();
            eventStr = "onSOSDevicePressCancel";
        }
        String mac = getDevId();
        WritableMap map = Arguments.createMap();
        map.putString("DevID", mac);
        map.putString("DevDetails", getDevInfoAsJsonString());
        Utils.sendEvent(mContext, eventStr, map );

    }

    public boolean isBinded(){
        return (mDeviceState == DeviceState.EConnectedState);
    }
    public void unbindDevice(){
        mDeviceState = DeviceState.EDisconnectState;
        _loc_unbindDevice();
    }

    private void _loc_unbindDevice(){
        mDeviceManager.unbindDevice(mDevice);
    }

    public void searchDevice(){
        Set<String> validDevIds =  ConnectService.mMinewDevicesMap.keySet();
        for (String devId: validDevIds){
            if(devId == getDevId()){
                mCurSearchStatus = "Finding...";
                String mac = getDevId();
                WritableMap lMap = Arguments.createMap();
                String lEventType = "onDeviceSearch";
                fillSearchData(lMap, mac);
                Utils.sendEvent(mContext, lEventType, lMap);
                mDevice.sendInstruction(InstrucIndex.InstrucIndex_Search);

                return;
            }
        }

        // try connecting the device
        bindDevice();
        mCurSearchStatus = "Device not found";
        String mac = getDevId();
        WritableMap lMap = Arguments.createMap();
        String lEventType = "onDeviceSearch";
        fillSearchData(lMap, mac);
        Utils.sendEvent(mContext, lEventType, lMap);
    }

    public void cancelSearchDevice(){

        mDevice.sendInstruction(InstrucIndex.InstrucIndex_CancelSearch);
    }


    private void fillSearchData(WritableMap aMap, String aMac){
        aMap.putString("DevID", aMac);
        aMap.putString("DevDetails", getDevInfoAsJsonString());
        aMap.putString("SearchStatus", mCurSearchStatus);
    }


    public void onDeviceChangeStatus(DeviceLinkStatus status){
        switch (status){
            case DeviceLinkStatus_Connecting:
                mDeviceState = DeviceState.EConnectingState;
                break;
            case DeviceLinkStatus_Connected:
                mDeviceState = DeviceState.EConnectedState;
                break;
            case DeviceLinkStatus_ConnectFailed:
            case DeviceLinkStatus_Disconnect:
                mDeviceState = DeviceState.EDisconnectState;
                break;
        }
    }

}
