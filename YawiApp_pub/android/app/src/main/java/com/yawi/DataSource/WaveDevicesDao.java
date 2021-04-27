package com.yawi.DataSource;

import android.content.Context;

import com.facebook.react.bridge.ReactContext;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.yawi.model.WaveDevice;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

public class WaveDevicesDao {

    SharedPrefDataStore mDataStore;

    public final Context mContext;
    public static final String mTag = "devices";

    @Inject
    public WaveDevicesDao(Context aContext, SharedPrefDataStore aSource) {
        mDataStore = aSource;
        mContext = aContext;
    }

    public List<WaveDevice> getAllDevices() {
        String lData = mDataStore.retrieveString(mTag);

        if (lData == null || lData.equals("")) {
            return new ArrayList<>();
        }
        List<WaveDevice> lDevices = WaveDevice.fromJsonString(lData, (ReactContext)mContext);
        return lDevices;
    }

    public void saveDevices(List<WaveDevice> aDevice){

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation()
                .create();
        String bindString = gson.toJson(aDevice);
        mDataStore.store(mTag, bindString);
    }

}
