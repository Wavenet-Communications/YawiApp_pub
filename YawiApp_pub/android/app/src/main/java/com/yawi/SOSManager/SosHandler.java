package com.yawi.SOSManager;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.CountDownTimer;
import android.telephony.SmsManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.yawi.model.ContactEntity;
import com.yawi.model.WaveDevice;
import com.yawi.utils.LocationProvider;
import com.yawi.utils.Utils;

import java.util.ArrayList;
import java.util.List;

import androidx.core.content.ContextCompat;

public class SosHandler {
    private ArrayList<ContactEntity> mSosContacts;
    private final LocationProvider mLocationProvider;
    private final ReactContext mContext;
    private WaveDevice mDevice;
    private int mCount;
    private static final int SOS_TIMEOUT_DURATION = 10 * 1000; // 10 sec
    private static final String SOS_SMS_MESSAGE = "SOS! am in emergency. This is my location %s";
    private static final String MAP_LINK = "https://www.google.com/maps/search/?api=1&query=%s,%s";

    private CountDownTimer mTimer;

    private SosHandler(ReactContext aContext, LocationProvider aLocationProvider) {
        mContext = aContext;
        mLocationProvider = aLocationProvider;
        mSosContacts = new ArrayList<>();
        mCount = 0;
    }

    public static SosHandler getInstance(ReactContext aContext, LocationProvider aLocationProvider){
        return new SosHandler(aContext, aLocationProvider);
    }

    public boolean isSosStarted(){
        return mDevice != null;
    }
    public void setSosContacts(List<ContactEntity> aSosContacts) {
        mSosContacts.clear();
        mSosContacts.addAll(aSosContacts);
    }

    public void doSosOnTimeout(WaveDevice aDevDetails) {
        mDevice = aDevDetails;
        if (mTimer != null) {
            mTimer.cancel();
            mTimer = null;
        }
        mCount = 10;
        mTimer = new CountDownTimer(SOS_TIMEOUT_DURATION, 1000) {

            @Override
            public void onTick(long millisUntilFinished) {
                WritableMap map = Arguments.createMap();
                map.putString("DevID", mDevice.getDevId());
                map.putString("SOSCount", ""+ (--mCount));
                Utils.sendEvent(mContext, "onSOSTimerCount", map );
            }

            @Override
            public void onFinish() {
                mLocationProvider.getLastKnownLocation(aLatLng -> {
                    String mapLink = String.format(MAP_LINK, aLatLng.getLatitude(), aLatLng.getLongitude());
                    String msg = String.format(SOS_SMS_MESSAGE, mapLink);
                    for (ContactEntity lContact: mSosContacts) {

                        sendSms(lContact.getNumber(), msg);
                        //doPhoneCall(lContact.getNumber());
                        break;
                    }
                    sendSosCancelEvent();
                    mDevice = null;
                });

            }
        };
        mTimer.start();
        WritableMap map = Arguments.createMap();
        map.putString("DevID", mDevice.getDevId());
        map.putString("SOSCount", ""+ (mCount));
        Utils.sendEvent(mContext, "onSOSTimerCount", map );

    }

    private void sendSosCancelEvent() {
        WritableMap map = Arguments.createMap();
        map.putString("DevID", mDevice.getDevId());
        map.putString("SOSCount", ""+0);
        Utils.sendEvent(mContext, "onSOSTimerFinished", map );
    }

    public void cancelSosTimeout() {
        if (mTimer != null) {
            mTimer.cancel();
            mTimer = null;
        }
        //sendSosCancelEvent();
        mDevice = null;

    }

    private void sendSms(String aPhoneNumber, String aMsg) {
        if (ContextCompat.checkSelfPermission(mContext, Manifest.permission.SEND_SMS)
                != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        SmsManager smsManager = SmsManager.getDefault();
        smsManager.sendTextMessage(aPhoneNumber, null, aMsg, null, null);
    }

    private void doPhoneCall(String aPhoneNumber) {
        if (ContextCompat.checkSelfPermission(mContext, Manifest.permission.CALL_PHONE)
                != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CALL);
        // Send phone number to intent as data
        intent.setData(Uri.parse("tel:" + "9986048209"));
        // Start the dialer app activity to make phone call
        mContext.getApplicationContext().startActivity(intent);
    }

}
