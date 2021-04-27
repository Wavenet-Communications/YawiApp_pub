package com.yawi.service;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;

import com.yawi.MainActivity;
import com.yawi.utils.NotificationUtils;
import com.yawi.R;
import com.minew.device.MinewDeviceManager;

import java.util.Timer;
import java.util.TimerTask;

import androidx.annotation.Nullable;

public class BLEConnectionMonitorService extends Service {
    public static final String CHANNEL_ID = "BLEConnectionMonitorServiceChannel";
    private MinewDeviceManager mDeviceManager;
    @Override
    public void onCreate() {
        super.onCreate();
        mDeviceManager = MinewDeviceManager.getInstance(getApplicationContext());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        if(Build.VERSION.SDK_INT >= 26) {
            createNotificationChannel();
            Intent notificationIntent = new Intent(this, MainActivity.class);
            PendingIntent pendingIntent =
                    PendingIntent.getActivity(this, 0, notificationIntent, 0);

            Notification notification =
                    new Notification.Builder(this, CHANNEL_ID)
                            .setContentTitle("YAWi App")
                            .setContentText("YAWi key finder is protecting your devices")
                            .setSmallIcon(R.drawable.ic_launcher)
                            .setContentIntent(pendingIntent)
                            .setTicker("Your devices are protected")
                            .build();

            startForeground(1, notification);
        }

        startMonitoring();
        return START_NOT_STICKY;
    }
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Foreground Service Channel",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        NotificationUtils.sendNotification(getApplicationContext(), "BLECMService is destroyed");
    }

    private void startMonitoring(){

        mDeviceManager.startScan();
        Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                mDeviceManager.stopScan();
                scheduleStartMonitoring();
            }
        }, 2*60*1000);

    }

    private void scheduleStartMonitoring(){
        Timer lTimer  = new Timer();
        lTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                //startMonitoring();
            }
        }, 10*60*1000);
    }

}



