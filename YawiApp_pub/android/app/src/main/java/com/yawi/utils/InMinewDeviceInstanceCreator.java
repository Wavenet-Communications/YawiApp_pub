package com.yawi.utils;

import android.content.Context;

import com.facebook.react.bridge.ReactContext;
import com.google.gson.InstanceCreator;
import com.minew.device.InMinewDevice;
import com.minew.device.MinewDeviceManager;
import com.yawi.model.WaveDevice;

import java.lang.reflect.Type;

public class InMinewDeviceInstanceCreator implements InstanceCreator<InMinewDevice> {

    public InMinewDeviceInstanceCreator(){
    }

    @Override
    public InMinewDevice createInstance(Type type) {

        InMinewDevice dev = new InMinewDevice();
        return dev;
    }
}
