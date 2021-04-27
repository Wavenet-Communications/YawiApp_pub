package com.yawi.utils;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.text.format.DateUtils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.yawi.R;
import com.yawi.model.WaveDevNotification;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public final class NotificationUtils {

    private static final String CHANNEL_ID = "12324";
    private NotificationUtils(){
        // no instance
    }

    private static void storeNotifications(Context aContext, List<WaveDevNotification> aNotifications){
        SharedPreferences lPreferences = aContext.getSharedPreferences("DevNotifications", Context.MODE_PRIVATE);
        Gson lGson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        String lData = lGson.toJson(aNotifications);

        SharedPreferences.Editor lEditor = lPreferences.edit();
        lEditor.putString("NotificationsData", lData);
        lEditor.commit();
    }
    public static String getNotificationsAsJsonString(Context aContext){
        SharedPreferences lPreferences = aContext.getSharedPreferences("DevNotifications", Context.MODE_PRIVATE);

        String lData = lPreferences.getString("NotificationsData", "");
        if(lData.equals("")){
            return "";
        }


        return lData;
    }

    public static List<WaveDevNotification> getNotifications(Context aContext){
        SharedPreferences lPreferences = aContext.getSharedPreferences("DevNotifications", Context.MODE_PRIVATE);

        String lData = lPreferences.getString("NotificationsData", "");
        if(lData.equals("")){
            return new ArrayList<>();
        }

        Gson lGson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();

        Type lType = (new TypeToken<List<WaveDevNotification>>() {
        }).getType();
        ArrayList lArrayList = (ArrayList)lGson.fromJson(lData, lType);

        return lArrayList;
    }

    public static void sendNotification(Context aContext, WaveDevNotification aNotif){
        List<WaveDevNotification> lCurNotif = getNotifications(aContext);

        ArrayList<WaveDevNotification> lNotifs = new ArrayList<>(lCurNotif);
        lNotifs.add(aNotif);

        storeNotifications(aContext, lNotifs);
        WritableMap lMap = Arguments.createMap();
        String lEventType = "onUpdateNotifications";
        fillData(aContext, lMap);
        sendEvent((ReactContext)aContext, lEventType, lMap);
        buildNotification(aContext, aNotif.mMessage);
    }

    public static void sendNotification(Context aContext, String aMsg){
        buildNotification(aContext, aMsg);
    }

    private static void sendEvent(ReactContext aReactContext, String aEventName, @NonNull WritableMap aParam){
        aReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(aEventName, aParam);
    }

    private static void fillData(Context aContext, WritableMap aMap){
        aMap.putString("Notifications", getNotificationsAsJsonString(aContext));
    }
    public static String getTimeAgoString(Context aContext, long aTimeInMS){
        CharSequence ltime = DateUtils.getRelativeDateTimeString(aContext, aTimeInMS, DateUtils.DAY_IN_MILLIS, DateUtils.WEEK_IN_MILLIS, 0);

        return ""+ltime;
    }


    public static void buildNotification(Context aContext, String aMsg){

        NotificationCompat.Builder builder = new NotificationCompat.Builder(aContext, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentTitle("YAWI")
                .setContentText(aMsg)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT);

        createNotificationChannel(aContext);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(aContext);

    // notificationId is a unique int for each notification that you must define
        notificationManager.notify(1, builder.build());
    }

    private static void createNotificationChannel(Context aContext){
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "WavenetNoficationChannel";
            String description = "WavenetNoficationChannel";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = aContext.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
}
