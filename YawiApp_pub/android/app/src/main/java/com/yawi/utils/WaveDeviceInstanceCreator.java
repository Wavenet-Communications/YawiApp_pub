package com.yawi.utils;

import android.content.Context;

import com.facebook.react.bridge.ReactContext;
import com.yawi.model.WaveDevice;
import com.google.gson.InstanceCreator;
import com.minew.device.MinewDeviceManager;

import java.lang.reflect.Type;

public class WaveDeviceInstanceCreator implements InstanceCreator<WaveDevice> {

    private final ReactContext mContext;
    private final MinewDeviceManager mDeviceManager;

    public WaveDeviceInstanceCreator(Context aContext){
        mContext = (ReactContext)aContext;
        mDeviceManager = MinewDeviceManager.getInstance(mContext);
    }

    @Override
    public WaveDevice createInstance(Type type) {

        WaveDevice lDev = new WaveDevice(mDeviceManager, mContext);

        return lDev;
    }
}
