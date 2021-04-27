package com.yawi.di;

import android.content.Context;

import com.minew.device.MinewDeviceManager;

import dagger.Module;
import dagger.Provides;

@Module
public class BleModule {

    @Provides
    public MinewDeviceManager provideMinewManager(Context aContext){
        return MinewDeviceManager.getInstance(aContext);
    }
}
