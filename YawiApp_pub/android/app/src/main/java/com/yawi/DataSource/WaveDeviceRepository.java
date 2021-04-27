package com.yawi.DataSource;

import com.facebook.react.bridge.ReactContext;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.yawi.model.DummyWaveDevice;
import com.yawi.model.WaveDevice;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import io.reactivex.rxjava3.core.Completable;
import io.reactivex.rxjava3.core.Single;

public class WaveDeviceRepository {

    private final WaveDevicesDao mDeviceDao;

    @Inject
    public WaveDeviceRepository(WaveDevicesDao aDeviceDao) {
        mDeviceDao = aDeviceDao;
    }

    public Single<List<WaveDevice>> getAllDevices() {
        return Single.create(emitter -> {
            List<WaveDevice> lDevices = mDeviceDao.getAllDevices();
            emitter.onSuccess(lDevices);
        });

    }

    public Completable addDevices(List<WaveDevice> aDevices){
        return Completable.create(emitter -> {
            mDeviceDao.saveDevices(aDevices);
            emitter.onComplete();
        });
    }

    public Completable addDevice(WaveDevice aDevice) {
        return Completable.create(emitter -> {
            ArrayList<WaveDevice> devList = new ArrayList<>(mDeviceDao.getAllDevices());

            devList.add(aDevice);
            mDeviceDao.saveDevices(devList);
            emitter.onComplete();
        });
    }

    public Completable removeDevice(WaveDevice aDevice){
        return Completable.create(emitter -> {
            ArrayList<WaveDevice> devList = new ArrayList<>(mDeviceDao.getAllDevices());

            for (WaveDevice dev: devList) {
                String devId;
                if (dev.mDevice == null) {
                    devId = DummyWaveDevice.DummyID;
                }else {
                    devId = dev.getDevId();
                }
                if (devId.equals(aDevice.getDevId())) {
                    devList.remove(dev);
                    break;
                }

            }

            mDeviceDao.saveDevices(devList);
            emitter.onComplete();
        });
    }

    public Completable removeAllDevies() {
        return Completable.create(emitter -> {
            ArrayList<WaveDevice> devList = new ArrayList<>();

            mDeviceDao.saveDevices(devList);
            emitter.onComplete();
        });
    }

}
