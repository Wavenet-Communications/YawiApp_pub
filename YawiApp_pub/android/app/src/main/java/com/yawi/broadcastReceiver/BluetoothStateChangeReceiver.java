package com.yawi.broadcastReceiver;

import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.minew.device.MinewDeviceManager;
import com.minew.device.MinewDeviceManagerListener;
import com.minew.device.enums.BluetoothState;




public class BluetoothStateChangeReceiver extends BroadcastReceiver {
    public BluetoothStateChangeReceiver() {
    }

    public void onReceive(Context var1, Intent var2) {
        if (var2.getAction().equals("android.bluetooth.adapter.action.STATE_CHANGED")) {
            BluetoothAdapter var3 = BluetoothAdapter.getDefaultAdapter();
            MinewDeviceManagerListener var4;
            if (var3.isEnabled()) {
                var4 = MinewDeviceManager.getInstance(var1.getApplicationContext()).getMinewDeviceManagerListener();
                if (var4 != null) {
                    var4.onUpdateBluetoothState(BluetoothState.BluetoothStatePowerOn);
                }
            } else {
                var4 = MinewDeviceManager.getInstance(var1.getApplicationContext()).getMinewDeviceManagerListener();
                if (var4 != null) {
                    var4.onUpdateBluetoothState(BluetoothState.BluetoothStatePowerOff);
                }
            }
        }

    }
}
