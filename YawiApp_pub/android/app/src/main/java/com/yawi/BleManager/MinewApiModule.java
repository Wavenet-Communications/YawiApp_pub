package com.yawi.BleManager;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.yawi.DataSource.ContactsRepository;
import com.yawi.DataSource.WaveDeviceRepository;
import com.yawi.DataSource.WaveNetRoomDatabase;
import com.yawi.SOSManager.SosHandler;
import com.yawi.di.DaggerAppComponent;
import com.yawi.model.ContactEntity;
import com.yawi.model.DummyWaveDevice;
import com.yawi.model.WaveDevice;
import com.yawi.utils.LocationProvider;
import com.yawi.utils.NotificationUtils;
import com.yawi.model.WaveDevNotification;
import com.yawi.service.BLEConnectionMonitorService;
import com.minew.device.MinewDevice;
import com.minew.device.MinewDeviceManager;
import com.minew.device.MinewDeviceManagerListener;
import com.minew.device.enums.BluetoothState;
import com.minew.device.enums.DeviceLinkStatus;
import com.minew.device.enums.ValueIndex;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers;
import io.reactivex.rxjava3.core.CompletableObserver;
import io.reactivex.rxjava3.core.Scheduler;
import io.reactivex.rxjava3.core.Single;
import io.reactivex.rxjava3.core.SingleObserver;
import io.reactivex.rxjava3.disposables.Disposable;
import io.reactivex.rxjava3.schedulers.Schedulers;

import static android.app.Activity.RESULT_OK;


public class MinewApiModule extends ReactContextBaseJavaModule{
    private final LocationProvider mLocationProvider;
    @Inject
    MinewDeviceManager mDeviceManager;
    @Inject
    WaveDeviceRepository mDeviceRepository;


    private static ReactApplicationContext mReactContext;
    private final static int REQUEST_ENABLE_BT = 1;
    private Promise mInitCallback;
    private Map<String, WaveDevice> mScannedDevices;
    private Map<String, WaveDevice> mBindDevices;
    private ContactsRepository mContactsRepository;
    private boolean mPhoneAsSosDevice;

    private String mSelectedDevice;

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener(){
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == REQUEST_ENABLE_BT ){
                if(resultCode == RESULT_OK){
                    WritableMap map = Arguments.createMap();
                    map.putBoolean("Check", true);
                    mInitCallback.resolve(map);
                }else{
                    mInitCallback.reject("-101", "Bluetooth is cancelled");
                }
            }
        }

    };



    private final MinewDeviceManagerListener mDevManagerListener = new MinewDeviceManagerListener() {
        @Override
        public void onDeviceChangeStatus(MinewDevice device, DeviceLinkStatus status) {
            WaveDevice lDev = mBindDevices.get(WaveDevice.getDevId(device));
            if (lDev == null){
                return;
            }
            lDev.onDeviceChangeStatus(status);
            switch (status) {
                case DeviceLinkStatus_ConnectFailed: {
                    mDeviceManager.startScan();
                    WaveDevNotification lNotif = WaveDevNotification.buildNotifcation(lDev, WaveDevNotification.ENotifyType_Disconnect);
                    NotificationUtils.sendNotification(mReactContext, lNotif);
                    Log.d("::onDeviceChangeStatus", "DeviceLinkStatus_ConnectFailed");
                    break;
                    }
                case DeviceLinkStatus_Disconnect: {
                    //mDeviceManager.startScan();
                    WaveDevNotification lNotif = WaveDevNotification.buildNotifcation(lDev, WaveDevNotification.ENotifyType_Disconnect);
                    NotificationUtils.sendNotification(mReactContext, lNotif);
                    Log.d("::onDeviceChangeStatus", "DeviceLinkStatus_Disconnect");
                    break;
                }
                case DeviceLinkStatus_Connected: {
                    WaveDevNotification lNotif = WaveDevNotification.buildNotifcation(lDev, WaveDevNotification.ENotifyType_Connect);
                    NotificationUtils.sendNotification(mReactContext, lNotif);
                    Log.d("::onDeviceChangeStatus", "DeviceLinkStatus_Connected" );
                    break;
                }
                case DeviceLinkStatus_Connecting:
                    Log.d("::onDeviceChangeStatus", "DeviceLinkStatus_Connecting" );
                    break;
            }

        }

        @Override
        public void onUpdateBluetoothState(BluetoothState state) {
            if (state == BluetoothState.BluetoothStatePowerOn){
                startScanning();
            }
        }

        @Override
        public void onRangeDevices(List<MinewDevice> devices) {
            Map<String, MinewDevice> lTemp = new HashMap<>(devices.size());
            WritableArray devList = Arguments.createArray();
            for (MinewDevice device: devices) {
                String mac = WaveDevice.getDevId(device);
                if(lTemp.containsKey(mac)){
                    continue;
                }
                lTemp.put(mac, device);
                WaveDevice lDev = mScannedDevices.get(mac);
                if (lDev == null) {
                    // check the device is in binded devices
                    if (mBindDevices.containsKey(mac)){
                        lDev = mBindDevices.get(mac);
                        //if(lDev.isDeviceActive()) {
                            continue;
                        //}
                        //mBindDevices.remove(mac);
                    }else{
                        lDev = new WaveDevice(mDeviceManager, mReactContext, device);
                    }
                    mScannedDevices.put(mac, lDev);
                }
                lDev.makeDeviceReady();
                WritableMap map = Arguments.createMap();
                map.putString("DevID", mac);
                map.putString("Details", lDev.getDevInfoAsJsonString());
                devList.pushMap(map);
            }
            sendEvent(mReactContext,"ScanResults", devList);
        }

        @Override
        public void onAppearDevices(List<MinewDevice> devices) {

        }

        @Override
        public void onDisappearDevices(List<MinewDevice> devices) {

        }

        @Override
        public void onUpdateBindDevice(List<MinewDevice> devices) {
            ArrayList<WaveDevice> lValidDevices = new ArrayList<>();
            Map<String, MinewDevice> lTemp = new HashMap<>(devices.size());

            WritableArray devList = Arguments.createArray();
            for (MinewDevice device: devices) {
                String mac = device.getValue(ValueIndex.ValueIndex_MacAddress).getStringValue();
                if(lTemp.containsKey(mac)){
                    continue;
                }
                lTemp.put(mac, device);

                WaveDevice lWaveDevice = mBindDevices.get(mac);

                if (lWaveDevice == null){
                    /*lWaveDevice = new WaveDevice(mDeviceManager, mReactContext, device);
                    lWaveDevice.bindDevice();
                    lWaveDevice.unbindDevice();*/
                    continue;
                }

                lWaveDevice.setDevice(device);
                if (lWaveDevice.isInSosMode()) {
                    lWaveDevice.setSosHandler(mSosHandler);
                }

                lWaveDevice.startListening();

                if (lWaveDevice.isDeviceActive()){
                    continue;
                }

                lValidDevices.add(lWaveDevice);
                WritableMap map = Arguments.createMap();
                map.putString("DevID", mac);
                map.putString("DevDetails", lWaveDevice.getDevInfoAsJsonString());
                devList.pushMap(map);
            }
            if (mBindDevices.containsKey(DummyWaveDevice.DummyID)) {
                DummyWaveDevice lWaveDevice = (DummyWaveDevice) mBindDevices.get(DummyWaveDevice.DummyID);
                WritableMap map = Arguments.createMap();
                map.putString("DevID", DummyWaveDevice.DummyID);
                map.putString("DevDetails", lWaveDevice.getDevInfoAsJsonString());
                devList.pushMap(map);
            }

            sendEvent(mReactContext,"BindDeviceUpdates", devList);
            udateDevices(lValidDevices);

        }

        private void sendEvent(ReactContext aReactContext, String aEventName, @NonNull WritableArray aParam){
            aReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(aEventName, aParam);
        }

    };
    private SosHandler mSosHandler;

    MinewApiModule(ReactApplicationContext context){
        super(context);
        mReactContext = context;
        mScannedDevices = new HashMap<>();
        mBindDevices = new HashMap<>();
        mLocationProvider = new LocationProvider(mReactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "MinewApiModule";
    }

    /**
     * initalize
     * @param promise
     */
    @ReactMethod
    public void initalize(Promise promise){
        mInitCallback = promise;
        if( mDeviceManager != null){
            WritableMap map = Arguments.createMap();
            map.putBoolean("Check", true);
            mInitCallback.resolve(map);
            return;
        }
        if (mContactsRepository == null) {
            mContactsRepository = new ContactsRepository(mReactContext);
        }

        mContactsRepository.getAllSosContacts(aContacts -> {
            mSosHandler = SosHandler.getInstance(mReactContext, mLocationProvider);
            mSosHandler.setSosContacts(aContacts);
        });
        DaggerAppComponent.factory().create(mReactContext).inject(this);

        mDeviceManager.setMinewDeviceManagerListener(mDevManagerListener);
        checkBluetooth();
        mDeviceManager.setDisableAutoProcessing(false);
        mDeviceManager.startService();
        getDevices();
    }

    /**
     * deInitalize
     */
    @ReactMethod
    public void deInitalize(){
        mDeviceManager.stopService();
    }
    /**
     * startScanning
     */
    @ReactMethod
    public void startScanning(){
        mScannedDevices.clear();
        mDeviceManager.startScan();
    }

    /**
     * stopScanning
     */
    @ReactMethod
    public void stopScanning(){
        mDeviceManager.stopScan();
    }

    @ReactMethod
    public void activateDevice(@NonNull String aDevID){
        WaveDevice dev = mScannedDevices.get(aDevID);

        if(dev != null){
            mScannedDevices.remove(aDevID);
            mBindDevices.put(aDevID, dev);
            dev.startListening();
            dev.activateDevice();
        }
    }


    @ReactMethod
    public void deactiveDevice(@NonNull String aDevId){
        WaveDevice lDev = mBindDevices.get(aDevId);

        if (aDevId != null){
            mBindDevices.remove(aDevId);
            mScannedDevices.put(aDevId, lDev);
            lDev.deactivateDevice();
            lDev.makeDeviceReady();
        }
    }
    /**
     * bindDevice
     * @param aDevName
     */
    @ReactMethod
    public void bindDevice(@NonNull String aDevId, String aDevName, Boolean aEnableSosMode, String aDevIcon){
        WaveDevice dev = mBindDevices.get(aDevId);

        if (dev != null){
            dev.setDevName(aDevName);
            dev.setSosMode(aEnableSosMode);
            dev.setSosHandler(mSosHandler);
            dev.setIcon(aDevIcon);

            dev.bindDevice();
        }
    }

    /**
     *
     * @param aDevId
     */
    @ReactMethod
    public void unbindDevice(@NonNull String aDevId){
        WaveDevice dev = mBindDevices.get(aDevId);
        if(dev != null){
            mBindDevices.remove(aDevId);
            dev.unbindDevice();
            udateDevices(new ArrayList<>(mBindDevices.values()));
        }
    }

    @ReactMethod
    public void updatDeviceIcon(@NonNull String aDevId, String aDevIcon){
        WaveDevice dev = mBindDevices.get(aDevId);
        if(dev != null){
            dev.setIcon(aDevIcon);
            udateDevices(new ArrayList<>(mBindDevices.values()));
        }

    }

    /**
     * getBindDevices
     * @param deviceListCb
     */
    @ReactMethod
    public void getBindDevices(final Promise deviceListCb){
        WritableArray devList = Arguments.createArray();

        for (WaveDevice device: mBindDevices.values()) {
            if(device.isDeviceActive()){
                continue;
            }
            String mac = device.getDevId();
            WritableMap map = Arguments.createMap();
            map.putString("DevID", mac);
            map.putString("DevDetails", device.getDevInfoAsJsonString());
            devList.pushMap(map);
        }
        deviceListCb.resolve(devList);
    }
    /**
     * findDevice
     * @param aDevId
     */
    @ReactMethod
    public void findDevice(@NonNull String aDevId){
        WaveDevice lDevice = mBindDevices.get(aDevId);
        if (lDevice != null) {
            lDevice.searchDevice();
        }
    }

    /**
     *
     * cancelFindDevice
     * @param aDevId
     */
    @ReactMethod
    public void cancelFindDevice(@NonNull String aDevId){
        WaveDevice lDevice = mBindDevices.get(aDevId);
        lDevice.cancelSearchDevice();
    }

    /**
     * getSelectedDevId
     * @param aPromise
     */
    @ReactMethod
    public void getSelectedDevId(final Promise aPromise) {

        WritableMap map = Arguments.createMap();
        map.putString("DevID", mSelectedDevice);
        aPromise.resolve(map);
    }

    /**
     * setSelectedDevId
     * @param aSelectedDevId
     */
    @ReactMethod
    public void setSelectedDevId(String aSelectedDevId) {
        mSelectedDevice = aSelectedDevId;
    }

    /**
     *
     * @param aPromise
     */
    @ReactMethod
    public void getNotifications(final Promise aPromise){
        WritableMap map = Arguments.createMap();
        map.putString("Notifications", NotificationUtils.getNotificationsAsJsonString(mReactContext));
        aPromise.resolve(map);
    }

    @ReactMethod
    public void getSosContacts(final Promise aPromise){
        mContactsRepository.getAllSosContacts((List<ContactEntity> aContacts)-> {

            String lContactStr = ContactEntity.toJsonString(aContacts);
            WritableMap map = Arguments.createMap();
            map.putString("SosContacts", lContactStr);
            aPromise.resolve(map);

        });
    }

    @ReactMethod
    public void saveSosContacts(String aContacts) {

        List<ContactEntity> contactList = ContactEntity.fromJsonString(aContacts);
        mContactsRepository.insertContacts(contactList);
        mSosHandler.setSosContacts(contactList);

    }

    @ReactMethod
    public void handleSos(String aDevId){
        WaveDevice lDev = mBindDevices.get(aDevId);
        mSosHandler.doSosOnTimeout(lDev);
    }

    @ReactMethod
    public void cancelSos(){
        mSosHandler.cancelSosTimeout();
    }

    @ReactMethod
    public void enablePhoneAsSosDevice(boolean enable) {
        mPhoneAsSosDevice = enable;
        if ( enable ){
            DummyWaveDevice lDummyWaveDevice = new DummyWaveDevice(mDeviceManager, mReactContext);
            mDeviceRepository.addDevice(lDummyWaveDevice)
                    .subscribeOn(Schedulers.io())
                    .observeOn(AndroidSchedulers.mainThread())
                    .subscribe(new CompletableObserver() {
                @Override
                public void onSubscribe(@io.reactivex.rxjava3.annotations.NonNull Disposable d) {
                }

                @Override
                public void onComplete() {
                    mBindDevices.put(lDummyWaveDevice.getDevId(), lDummyWaveDevice);
                }

                @Override
                public void onError(@io.reactivex.rxjava3.annotations.NonNull Throwable e) {

                }
            });
        }else {
            DummyWaveDevice lDummyWaveDevice = (DummyWaveDevice) mBindDevices.get(DummyWaveDevice.DummyID);
            if (lDummyWaveDevice != null) {
                mDeviceRepository.removeDevice(lDummyWaveDevice)
                        .subscribeOn(Schedulers.io())
                        .observeOn(AndroidSchedulers.mainThread())
                        .subscribe(new CompletableObserver() {
                            @Override
                            public void onSubscribe(@io.reactivex.rxjava3.annotations.NonNull Disposable d) {

                            }

                            @Override
                            public void onComplete() {
                                mBindDevices.remove(DummyWaveDevice.DummyID);
                            }

                            @Override
                            public void onError(@io.reactivex.rxjava3.annotations.NonNull Throwable e) {

                            }
                        });
            }
        }
    }

    @ReactMethod
    public void isPhoneEnabledAsSosDevice(final Promise aPromise){
        boolean isEnable = false;
        DummyWaveDevice lDummyWaveDevice = (DummyWaveDevice) mBindDevices.get(DummyWaveDevice.DummyID);
        if (lDummyWaveDevice != null) {
            isEnable = true;
        }

        WritableMap map = Arguments.createMap();
        map.putBoolean("enable", isEnable);
        aPromise.resolve(map);

    }

    private void getDevices() {


        Single<List<WaveDevice>> bindDevicesInnative = mDeviceRepository.getAllDevices();
        bindDevicesInnative
                .subscribe(new SingleObserver<List<WaveDevice>>() {
            @Override
            public void onSubscribe(@io.reactivex.rxjava3.annotations.NonNull Disposable d) {

            }

            @Override
            public void onSuccess(@io.reactivex.rxjava3.annotations.NonNull List<WaveDevice> aWaveDevices) {
                ArrayList<MinewDevice> lDevices = new ArrayList<>();
                for (WaveDevice lDev : aWaveDevices){
                    if (lDev.mDevice == null) {
                        DummyWaveDevice lDummyWaveDevice = new DummyWaveDevice(mDeviceManager, mReactContext);
                        lDev = lDummyWaveDevice;
                    }
                    mBindDevices.put(lDev.getDevId(), lDev);
                    lDev.applyDefaultConfig();
                    if (lDev.isInSosMode()) {
                        lDev.setSosHandler(mSosHandler);
                    }
                    lDev.startListening();
                    lDevices.add(lDev.mDevice);
                }

                mDeviceManager.bindDevices = lDevices;
                startConnectionMonitorService();

            }

            @Override
            public void onError(@io.reactivex.rxjava3.annotations.NonNull Throwable e) {

            }
        });

    }

    private void startConnectionMonitorService(){
        Intent serviceIntent = new Intent(mReactContext, BLEConnectionMonitorService.class);
        serviceIntent.putExtra("inputExtra", "Check connection");
        ContextCompat.startForegroundService(mReactContext, serviceIntent);
    }

    private void udateDevices(List<WaveDevice> bindDevices) {
        mDeviceRepository.addDevices(bindDevices).subscribeOn(Schedulers.io()).subscribe();
    }


    // Private methods
    private void checkBluetooth() {
        BluetoothState bluetoothState = mDeviceManager.checkBluetoothState();
        switch (bluetoothState) {
            case BluetoothStateNotSupported:
                Toast.makeText(this.getReactApplicationContext(), "Not Support BLE", Toast.LENGTH_SHORT).show();
                mInitCallback.reject("-101", "Not Support BLE");
                break;
            case BluetoothStatePowerOff:
                showBLEDialog();
                break;
            case BluetoothStatePowerOn:
                WritableMap map = Arguments.createMap();
                map.putBoolean("Check", true);
                mInitCallback.resolve(map);
                break;
        }

    }

    private void showBLEDialog() {
        Intent enableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        this.getReactApplicationContext().startActivityForResult(enableIntent, REQUEST_ENABLE_BT, null);
    }

}
