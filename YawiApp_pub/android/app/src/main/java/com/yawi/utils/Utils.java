package com.yawi.utils;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import androidx.annotation.NonNull;

public class Utils {
    public static class LatLng {
        private final String mLatitude;
        private final String mLongitude;

        public LatLng(String aLatitude, String aLongitude) {
            mLatitude = aLatitude;
            mLongitude = aLongitude;
        }
        public String getLatitude() {
            return mLatitude;
        }
        public String getLongitude() {
            return mLongitude;
        }
    }
    private Utils(){
    }


    public static void sendEvent(ReactContext aReactContext, String aEventName, @NonNull WritableMap aParam){
        aReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(aEventName, aParam);
    }

    public static void sendEvent(ReactContext aReactContext, String aEventName, @NonNull WritableArray aParam){
        aReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(aEventName, aParam);
    }


}
